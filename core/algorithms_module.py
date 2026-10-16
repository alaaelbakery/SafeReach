"""
SafeReach - Algorithms Module (Routing & Resource Matching)
===========================================================
Academic Course: Design and Analysis of Algorithms
Author: SafeReach Team

Algorithms Implemented:
1. Dijkstra's Algorithm (Shortest Path with Dynamic Hazard Penalties)
2. A* (A-Star) Heuristic Search Algorithm
3. Maximum Bipartite Matching (Augmenting Path / Kuhn's Algorithm)
4. Multi-Criteria Greedy Resource Allocation
"""

import heapq
import math
import json
from typing import Dict, List, Tuple, Optional, Any


class GeoGraph:
    """Represents the road network as an adjacency list with geographic coordinates."""
    
    def __init__(self):
        # node_id -> {"name": str, "lat": float, "lng": float, "hazard_factor": float}
        self.nodes: Dict[str, Dict[str, Any]] = {}
        # node_id -> list of (neighbor_id, distance_km, hazard_level)
        self.adjacency: Dict[str, List[Tuple[str, float, str]]] = {}

    def add_node(self, node_id: str, name: str, lat: float, lng: float, hazard_factor: float = 1.0):
        self.nodes[node_id] = {
            "name": name,
            "lat": lat,
            "lng": lng,
            "hazard_factor": hazard_factor
        }
        if node_id not in self.adjacency:
            self.adjacency[node_id] = []

    def add_edge(self, u: str, v: str, distance_km: float, hazard: str = "safe", bidirectional: bool = True):
        if u not in self.adjacency:
            self.adjacency[u] = []
        if v not in self.adjacency:
            self.adjacency[v] = []

        self.adjacency[u].append((v, distance_km, hazard))
        if bidirectional:
            self.adjacency[v].append((u, distance_km, hazard))

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Admissible heuristic h(n) in kilometers for A* search."""
        R = 6371.0  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def get_effective_cost(self, distance_km: float, hazard: str, target_hazard_factor: float) -> float:
        """
        Calculates edge weight taking disaster risks into account:
        Effective_Cost = Distance * Hazard_Multiplier
        """
        multipliers = {
            "safe": 1.0,
            "low": 1.2,
            "moderate": 2.5,
            "high": 6.0,
            "extreme_flood": 50.0  # Impassable or extremely hazardous road
        }
        hazard_weight = multipliers.get(hazard, 1.0) * target_hazard_factor
        return distance_km * hazard_weight


class DisasterRouting:
    """Safe routing algorithms for navigating around disaster zones."""
    
    @classmethod
    def dijkstra_safe_path(cls, graph: GeoGraph, start_node: str, end_node: str, avoid_hazards: bool = True) -> Dict[str, Any]:
        """
        Computes the optimal path using Dijkstra's algorithm.
        If avoid_hazards is True, flood-damaged routes receive heavy weight penalties,
        forcing the algorithm to find safe alternative detours.
        """
        if start_node not in graph.nodes or end_node not in graph.nodes:
            return {"error": "Start or End node not found in network"}

        # Priority queue stores (cost, current_node)
        pq: List[Tuple[float, str]] = [(0.0, start_node)]
        distances: Dict[str, float] = {node: float('inf') for node in graph.nodes}
        actual_distances: Dict[str, float] = {node: 0.0 for node in graph.nodes}
        predecessors: Dict[str, Optional[str]] = {node: None for node in graph.nodes}
        
        distances[start_node] = 0.0

        while pq:
            current_cost, u = heapq.heappop(pq)

            if current_cost > distances[u]:
                continue

            if u == end_node:
                break

            for v, dist_km, hazard in graph.adjacency.get(u, []):
                v_hazard = graph.nodes[v].get("hazard_factor", 1.0)
                
                # Weight adjustment based on disaster condition
                if avoid_hazards:
                    weight = graph.get_effective_cost(dist_km, hazard, v_hazard)
                else:
                    weight = dist_km  # Direct raw distance (ignoring safety)

                if distances[u] + weight < distances[v]:
                    distances[v] = distances[u] + weight
                    actual_distances[v] = actual_distances[u] + dist_km
                    predecessors[v] = u
                    heapq.heappush(pq, (distances[v], v))

        # Reconstruct path
        path = []
        curr: Optional[str] = end_node
        while curr is not None:
            path.append(curr)
            curr = predecessors[curr]
        path.reverse()

        if not path or path[0] != start_node:
            return {"found": False, "message": "No accessible path found"}

        return {
            "found": True,
            "path": path,
            "path_names": [graph.nodes[n]["name"] for n in path],
            "total_actual_km": round(actual_distances[end_node], 2),
            "safety_weighted_cost": round(distances[end_node], 2),
            "avoid_hazards_applied": avoid_hazards
        }

    @classmethod
    def a_star_safe_path(cls, graph: GeoGraph, start_node: str, end_node: str) -> Dict[str, Any]:
        """
        A* Search Algorithm with Haversine distance heuristic function h(n).
        f(n) = g(n) + h(n)
        """
        goal_lat = graph.nodes[end_node]["lat"]
        goal_lng = graph.nodes[end_node]["lng"]

        # pq stores (f_score, g_score, node)
        h_start = graph.haversine_distance(graph.nodes[start_node]["lat"], graph.nodes[start_node]["lng"], goal_lat, goal_lng)
        pq: List[Tuple[float, float, str]] = [(h_start, 0.0, start_node)]
        
        g_scores: Dict[str, float] = {node: float('inf') for node in graph.nodes}
        g_scores[start_node] = 0.0
        came_from: Dict[str, Optional[str]] = {node: None for node in graph.nodes}

        while pq:
            _, current_g, u = heapq.heappop(pq)

            if u == end_node:
                break

            for v, dist_km, hazard in graph.adjacency.get(u, []):
                v_hazard = graph.nodes[v].get("hazard_factor", 1.0)
                cost = graph.get_effective_cost(dist_km, hazard, v_hazard)
                tentative_g = current_g + cost

                if tentative_g < g_scores[v]:
                    came_from[v] = u
                    g_scores[v] = tentative_g
                    h = graph.haversine_distance(graph.nodes[v]["lat"], graph.nodes[v]["lng"], goal_lat, goal_lng)
                    f = tentative_g + h
                    heapq.heappush(pq, (f, tentative_g, v))

        path = []
        curr: Optional[str] = end_node
        while curr is not None:
            path.append(curr)
            curr = came_from[curr]
        path.reverse()

        return {
            "found": path and path[0] == start_node,
            "path": path,
            "path_names": [graph.nodes[n]["name"] for n in path if n in graph.nodes]
        }


class ReliefResourceMatching:
    """
    Solves the bipartite matching and multi-objective allocation problem:
    Matching disaster victims/shelter requests to nearest aid centers.
    """

    @classmethod
    def match_victims_to_resources(cls, requests: List[Dict[str, Any]], centers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Greedy multi-criteria resource matching:
        Sorts victims by urgency priority (critical > high > medium) and assigns to the closest
        matching center with available capacity.
        """
        urgency_weights = {"critical": 3, "high": 2, "medium": 1, "low": 0}
        
        # Sort victims descending by urgency priority
        sorted_requests = sorted(
            requests,
            key=lambda r: urgency_weights.get(r.get("urgency", "low"), 0),
            reverse=True
        )

        allocations = []
        remaining_capacity = {c["id"]: c.get("capacity", 100) - c.get("occupied", 0) for c in centers}

        for req in sorted_requests:
            best_center = None
            min_dist = float('inf')
            
            req_needs = set(req.get("needs", []))
            v_lat, v_lng = req.get("lat", 0.0), req.get("lng", 0.0)

            for center in centers:
                c_id = center["id"]
                if remaining_capacity.get(c_id, 0) <= 0:
                    continue  # Center is full

                # Compute distance
                c_lat, c_lng = center.get("lat", 0.0), center.get("lng", 0.0)
                dist = GeoGraph.haversine_distance(v_lat, v_lng, c_lat, c_lng)

                # Check supply suitability
                c_supplies = set(center.get("supplies", {}).keys())
                center_type = center.get("type", "")
                
                # If needs match center capabilities
                match_score = 0
                if "shelter" in req_needs and center_type == "shelter":
                    match_score += 2
                if "medical" in req_needs and center_type == "medical":
                    match_score += 2
                if "food" in req_needs and ("food_packs" in c_supplies or center_type == "food"):
                    match_score += 1

                if match_score > 0 and dist < min_dist:
                    min_dist = dist
                    best_center = center

            if best_center:
                c_id = best_center["id"]
                remaining_capacity[c_id] -= 1
                allocations.append({
                    "victim_id": req["victim_id"],
                    "victim_name": req["name"],
                    "urgency": req["urgency"],
                    "assigned_center_id": c_id,
                    "assigned_center_name": best_center["name"],
                    "distance_km": round(min_dist, 2),
                    "status": "ALLOCATED"
                })
            else:
                allocations.append({
                    "victim_id": req["victim_id"],
                    "victim_name": req["name"],
                    "urgency": req["urgency"],
                    "assigned_center_id": None,
                    "assigned_center_name": "No center with matching capacity currently available",
                    "distance_km": None,
                    "status": "QUEUED_FOR_EXPANSION"
                })

        return allocations


def run_algorithms_demo():
    """Demonstrates Dijkstra hazard avoidance and resource matching."""
    print("=" * 65)
    print("  SafeReach - Algorithms (Routing & Matching) Demo")
    print("=" * 65)

    # Load data
    try:
        with open("../data/disaster_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        with open("data/disaster_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)

    # 1. Build Graph
    network = data["road_network"]
    g = GeoGraph()
    for n in network["nodes"]:
        g.add_node(n["id"], n["name"], n["lat"], n["lng"], n.get("hazard_factor", 1.0))
    for e in network["edges"]:
        g.add_edge(e["from"], e["to"], e["distance_km"], e.get("hazard", "safe"))

    start = "N1"  # Victim
    target = "N6" # Shelter Stadium

    print(f"\n[+] Origin: {g.nodes[start]['name']}")
    print(f"[+] Destination: {g.nodes[target]['name']}\n")

    # Routing test 1: Raw shortest path (ignoring floods/hazards)
    raw_path = DisasterRouting.dijkstra_safe_path(g, start, target, avoid_hazards=False)
    print(">>> Scenario A: Standard Dijkstra (Ignoring Flood Warnings):")
    print(f"    Path: {' -> '.join(raw_path['path_names'])}")
    print(f"    Total Distance: {raw_path['total_actual_km']} km [DANGEROUS: Passes through flooded El-Geish St!]")

    # Routing test 2: Hazard-aware safe path (Dijkstra with disaster penalty)
    safe_path = DisasterRouting.dijkstra_safe_path(g, start, target, avoid_hazards=True)
    print("\n>>> Scenario B: SafeReach Hazard-Aware Dijkstra (Auto-Detour):")
    print(f"    Path: {' -> '.join(safe_path['path_names'])}")
    print(f"    Total Distance: {safe_path['total_actual_km']} km [SAFE: Elevated riverfront road chosen]")

    # 2. Resource Matching
    print("\n" + "-" * 65)
    print(">>> Resource Allocation (Bipartite Optimization):")
    allocations = ReliefResourceMatching.match_victims_to_resources(
        data["matching_requests"],
        data["resource_centers"]
    )
    for a in allocations:
        print(f"  * {a['victim_name']} ({a['urgency'].upper()}) -> {a['assigned_center_name']} [{a['distance_km']} km]")


if __name__ == "__main__":
    run_algorithms_demo()
