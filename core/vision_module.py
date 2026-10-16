"""
SafeReach - Computer Vision & Pattern Recognition Module
=========================================================
Academic Course: Pattern Recognition / Computer Vision
Author: SafeReach Team

Features Implemented:
1. Disaster Damage & Hazard Object Detection (YOLO / CNN format)
   Classes: [damaged_building, flooded_area, person_in_need, emergency_vehicle, safe_zone]
2. Damage Severity Index (DSI) Calculation
3. Bounding Box Geometry & Confidence Scoring
4. Pattern Feature Analysis (Flood Water Ratio, Structural Rupture Ratio)
"""

import json
from typing import List, Dict, Any, Tuple


class DisasterObjectDetector:
    """Simulates and integrates Object Detection and Pattern Recognition for disaster scenes."""

    CLASS_LABELS = {
        0: "damaged_building",
        1: "flooded_area",
        2: "person_in_need",
        3: "emergency_vehicle",
        4: "safe_zone"
    }

    CLASS_COLORS = {
        "damaged_building": "#E63946",   # Red
        "flooded_area": "#1D3557",       # Deep Blue
        "person_in_need": "#E76F51",     # Orange/Amber
        "emergency_vehicle": "#2A9D8F",  # Teal
        "safe_zone": "#2ECC71"           # Green
    }

    # Pre-evaluated benchmark scenes for testing without requiring heavy GPU weights
    BENCHMARK_SCENES = {
        "mansoura_flood_scene_01": {
            "title": "شارع الجمهورية - فيضان وغمر مائي",
            "image_type": "flood",
            "resolution": [800, 600],
            "detections": [
                {"class": "flooded_area", "confidence": 0.94, "bbox": [50, 250, 750, 580]},
                {"class": "damaged_building", "confidence": 0.88, "bbox": [120, 80, 420, 320]},
                {"class": "person_in_need", "confidence": 0.91, "bbox": [480, 290, 540, 410]},
                {"class": "person_in_need", "confidence": 0.86, "bbox": [560, 310, 620, 420]}
            ]
        },
        "earthquake_rubble_scene_02": {
            "title": "حي الجامعة - انهيار مبنى سكني",
            "image_type": "earthquake",
            "resolution": [800, 600],
            "detections": [
                {"class": "damaged_building", "confidence": 0.96, "bbox": [100, 60, 700, 480]},
                {"class": "person_in_need", "confidence": 0.89, "bbox": [320, 380, 380, 460]},
                {"class": "emergency_vehicle", "confidence": 0.92, "bbox": [600, 420, 780, 570]}
            ]
        },
        "safe_shelter_scene_03": {
            "title": "مركز إيواء الاستاد - منطقة آمنة",
            "image_type": "shelter",
            "resolution": [800, 600],
            "detections": [
                {"class": "safe_zone", "confidence": 0.98, "bbox": [40, 40, 760, 560]},
                {"class": "emergency_vehicle", "confidence": 0.95, "bbox": [100, 350, 280, 520]}
            ]
        }
    }

    @classmethod
    def calculate_damage_severity(cls, detections: List[Dict[str, Any]], image_w: int = 800, image_h: int = 600) -> Dict[str, Any]:
        """
        Calculates the Disaster Damage Severity Index (DSI):
        Combines total flooded surface area, damaged building counts, and victims needing rescue.
        """
        total_image_area = image_w * image_h
        flood_area = 0
        building_damage_area = 0
        people_count = 0

        for d in detections:
            cls_name = d["class"]
            x1, y1, x2, y2 = d["bbox"]
            box_area = max(0, x2 - x1) * max(0, y2 - y1)

            if cls_name == "flooded_area":
                flood_area += box_area
            elif cls_name == "damaged_building":
                building_damage_area += box_area
            elif cls_name == "person_in_need":
                people_count += 1

        # Normalized ratios (0.0 to 1.0)
        flood_ratio = min(1.0, flood_area / total_image_area)
        building_ratio = min(1.0, building_damage_area / total_image_area)
        people_penalty = min(0.3, people_count * 0.1)

        # Weighted severity formulation
        dsi_score = (0.40 * flood_ratio) + (0.45 * building_ratio) + people_penalty
        severity_percentage = min(100.0, dsi_score * 100.0)

        if severity_percentage >= 75.0:
            category = "CRITICAL (حرج - كارثة تستوجب تدخلاً فورياً)"
            color = "#E63946"
            action = "إرسال قوارب إنقاذ ودفاع مدني فوري وإخلاء المحيط"
        elif severity_percentage >= 45.0:
            category = "SEVERE (شديد - خطورة عالية)"
            color = "#F4A261"
            action = "توجيه سيارات الإسعاف وفرق الإخلاء السريع"
        elif severity_percentage >= 20.0:
            category = "MODERATE (متوسط - أضرار جزئية)"
            color = "#E9C46A"
            action = "مراقبة المنطقة وتأمين وصول المساعدات الغذائية"
        else:
            category = "LOW / SAFE (منخفض - منطقة آمنة نسبياً)"
            color = "#2ECC71"
            action = "المنطقة صالحة لإنشاء نقطة إغاثة مؤقتة"

        return {
            "severity_score": round(severity_percentage, 1),
            "category": category,
            "status_color": color,
            "recommended_action": action,
            "metrics": {
                "flood_coverage_pct": round(flood_ratio * 100, 1),
                "structural_damage_pct": round(building_ratio * 100, 1),
                "people_at_risk": people_count
            }
        }


def run_vision_demo():
    """Demonstrates detection inference and severity scoring."""
    print("=" * 65)
    print("  SafeReach - Computer Vision & Pattern Recognition Demo")
    print("=" * 65)

    detector = DisasterObjectDetector()

    for scene_id, scene in detector.BENCHMARK_SCENES.items():
        print(f"\n[+] Analyzing Scene: {scene['title']} ({scene['image_type']})")
        print(f"    Detections Count: {len(scene['detections'])}")
        
        for idx, d in enumerate(scene['detections'], 1):
            bbox = d['bbox']
            print(f"      {idx}. Class: {d['class']:<18} | Conf: {d['confidence']*100:.1f}% | BBox: [{bbox[0]}, {bbox[1]}, {bbox[2]}, {bbox[3]}]")

        w, h = scene["resolution"]
        assessment = detector.calculate_damage_severity(scene["detections"], w, h)
        print(f"    >>> Severity Index: {assessment['severity_score']}% -> {assessment['category']}")
        print(f"    >>> Action Plan:   {assessment['recommended_action']}")


if __name__ == "__main__":
    run_vision_demo()
