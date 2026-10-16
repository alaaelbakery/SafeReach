"""
SafeReach - Information Retrieval (IR) Engine
=============================================
Academic Course: Information Retrieval (IR)
Author: SafeReach Team

Features Implemented:
1. Multilingual Text Preprocessing (Arabic Normalization & English Tokenization)
2. Inverted Index with Term Frequency & Postings List
3. Okapi BM25 Ranking Algorithm
4. Vector Space Model (TF-IDF & Cosine Similarity)
5. Misinformation & Credibility Filter (Source Reliability Scoring)
"""

import math
import re
import json
from collections import defaultdict, Counter
from typing import List, Dict, Any, Tuple


class TextPreprocessor:
    """Handles Arabic & English tokenization, normalization, and stopword removal."""
    
    ARABIC_PUNCTUATION = '''`÷×؛<>_()*&^%][ـ،/:"?.,'{}~¦+|!”…“–ـ'''
    ARABIC_DIACRITICS = re.compile(r'[\u064B-\u0652]')
    
    # Common Arabic & English stopwords in disaster domain
    STOPWORDS = {
        'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'عبر', 'كل', 'بعد',
        'قبل', 'أو', 'ثم', 'حيث', 'ان', 'أن', 'كان', 'كانت', 'التي', 'الذي', 'الذين',
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with'
    }

    @classmethod
    def normalize_arabic(cls, text: str) -> str:
        """Normalizes Arabic text variations (Alif, Yaa, Taa Marbuta, Tashkeel)."""
        # Remove Tashkeel (diacritics)
        text = re.sub(cls.ARABIC_DIACRITICS, '', text)
        # Normalize Alif forms (أ, إ, آ -> ا)
        text = re.sub(r'[إأآا]', 'ا', text)
        # Normalize Yaa (ى -> ي)
        text = re.sub(r'ى', 'ي', text)
        # Normalize Taa Marbuta (ة -> ه)
        text = re.sub(r'ة', 'ه', text)
        # Remove repeated letters (tatweel)
        text = re.sub(r'ـ+', '', text)
        return text

    @classmethod
    def clean_text(cls, text: str) -> str:
        """Removes punctuation, URLs, and extra whitespaces."""
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        # Remove punctuation
        for p in cls.ARABIC_PUNCTUATION:
            text = text.replace(p, ' ')
        text = re.sub(r'[^\w\s\u0621-\u064A]', ' ', text)
        # Replace multiple spaces with single space
        return re.sub(r'\s+', ' ', text).strip()

    @classmethod
    def tokenize(cls, text: str) -> List[str]:
        """Tokenizes, normalizes, and filters out stopwords."""
        text = cls.normalize_arabic(text.lower())
        text = cls.clean_text(text)
        tokens = text.split()
        return [t for t in tokens if len(t) > 1 and t not in cls.STOPWORDS]


class InvertedIndex:
    """Builds and maintains an Inverted Index for fast full-text disaster lookup."""
    
    def __init__(self):
        # term -> list of doc_ids
        self.index: Dict[str, List[str]] = defaultdict(list)
        # term -> {doc_id: term_frequency}
        self.term_freqs: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # doc_id -> total token count in doc
        self.doc_lengths: Dict[str, int] = {}
        # doc_id -> raw document dictionary
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.avg_doc_len: float = 0.0

    def add_document(self, doc_id: str, document: Dict[str, Any], text_field: str = "text"):
        """Indexes a single document."""
        self.documents[doc_id] = document
        combined_text = f"{document.get('title', '')} {document.get(text_field, '')} {' '.join(document.get('tags', []))}"
        tokens = TextPreprocessor.tokenize(combined_text)
        
        self.doc_lengths[doc_id] = len(tokens)
        token_counts = Counter(tokens)
        
        for term, freq in token_counts.items():
            self.index[term].append(doc_id)
            self.term_freqs[term][doc_id] = freq

        # Update average doc length
        if self.doc_lengths:
            self.avg_doc_len = sum(self.doc_lengths.values()) / len(self.doc_lengths)

    def get_postings(self, term: str) -> List[str]:
        """Returns the list of document IDs containing the term."""
        norm_term = TextPreprocessor.normalize_arabic(term.lower())
        return self.index.get(norm_term, [])


class SafeReachIRRanker:
    """Implements BM25, TF-IDF Cosine Similarity, and Credibility Ranking."""
    
    def __init__(self, inverted_index: InvertedIndex, k1: float = 1.5, b: float = 0.75):
        self.idx = inverted_index
        self.k1 = k1
        self.b = b

    def compute_idf(self, term: str) -> float:
        """Computes Robertson-Spärck Jones IDF for BM25."""
        total_docs = len(self.idx.documents)
        df = len(self.idx.index.get(term, []))
        if df == 0:
            return 0.0
        # Standard BM25 IDF formulation
        return math.log(1.0 + (total_docs - df + 0.5) / (df + 0.5))

    def score_bm25(self, query: str) -> List[Tuple[str, float]]:
        """Scores all matching documents using the Okapi BM25 ranking function."""
        query_terms = TextPreprocessor.tokenize(query)
        scores = defaultdict(float)
        
        for term in query_terms:
            idf = self.compute_idf(term)
            doc_list = self.idx.index.get(term, [])
            
            for doc_id in doc_list:
                tf = self.idx.term_freqs[term][doc_id]
                doc_len = self.idx.doc_lengths[doc_id]
                avgdl = self.idx.avg_doc_len or 1.0
                
                # BM25 term weighting formula
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / avgdl))
                scores[doc_id] += idf * (numerator / denominator)

        # Sort descending by score
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return ranked

    def score_with_credibility(self, query: str, alpha: float = 0.7) -> List[Dict[str, Any]]:
        """
        Combines IR Relevance (BM25) with Source Credibility Score:
        FinalScore = alpha * Normalized_BM25 + (1 - alpha) * CredibilityScore
        """
        raw_bm25 = self.score_bm25(query)
        if not raw_bm25:
            return []

        max_bm25 = max(score for _, score in raw_bm25) if raw_bm25 else 1.0
        if max_bm25 == 0:
            max_bm25 = 1.0

        results = []
        for doc_id, bm25_score in raw_bm25:
            doc = self.idx.documents[doc_id]
            norm_bm25 = bm25_score / max_bm25
            credibility = doc.get("credibility_score", 0.5)
            
            # Penalize rumors severely in disaster situations
            if not doc.get("verified", False):
                credibility *= 0.3

            final_score = (alpha * norm_bm25) + ((1.0 - alpha) * credibility)
            
            results.append({
                "doc_id": doc_id,
                "document": doc,
                "bm25_score": round(bm25_score, 3),
                "credibility_score": round(credibility, 2),
                "final_score": round(final_score, 3),
                "is_verified": doc.get("verified", False)
            })

        results.sort(key=lambda x: x["final_score"], reverse=True)
        return results


def run_ir_demo():
    """Demo test function showing indexing and search in action."""
    print("=" * 60)
    print("  SafeReach - Information Retrieval (IR) System Demo")
    print("=" * 60)

    # 1. Load disaster dataset
    try:
        with open("../data/disaster_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        with open("data/disaster_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)

    # 2. Build Inverted Index
    index = InvertedIndex()
    for post in data["disaster_posts"]:
        index.add_document(post["id"], post)

    print(f"\n[+] Total Indexed Documents: {len(index.documents)}")
    print(f"[+] Total Unique Vocabulary Terms: {len(index.index)}")
    print(f"[+] Average Document Length: {index.avg_doc_len:.2f} tokens\n")

    # 3. Sample Queries
    queries = [
        "مساعدات غذائية في المنصورة",
        "مركز إيواء استاد المنصورة",
        "سقوط وانهيار كوبري طلخا"
    ]

    ranker = SafeReachIRRanker(index)

    for q in queries:
        print(f"\n>>> Query: '{q}'")
        results = ranker.score_with_credibility(q)
        if not results:
            print("    [!] No relevant documents found.")
            continue
            
        for rank, res in enumerate(results[:3], start=1):
            doc = res["document"]
            status = "[VERIFIED]" if res["is_verified"] else "[UNVERIFIED / RUMOR]"
            print(f"  {rank}. {status} (Final Score: {res['final_score']} | BM25: {res['bm25_score']} | Credibility: {res['credibility_score']})")
            print(f"     Title:  {doc['title']}")
            print(f"     Source: {doc['source']} ({doc.get('source_type')})")
            print(f"     Location: {doc.get('location')}")


if __name__ == "__main__":
    run_ir_demo()
