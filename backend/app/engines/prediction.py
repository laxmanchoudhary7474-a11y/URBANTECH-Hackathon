from typing import List, Dict
from app.models.domain import Bin, SystemSettings, PredictionSchema, RiskLevel

def run_prediction(bins: List[Bin], settings: SystemSettings) -> Dict[str, PredictionSchema]:
    predictions = {}
    
    for b in bins:
        # Base calculation
        fill_rate = b.fill_rate * settings.waste_generation_multiplier
        remaining_capacity_percent = 100.0 - b.current_fill_percent
        
        if fill_rate <= 0:
            eta_hours = 999.0 # practically never
        else:
            eta_hours = remaining_capacity_percent / fill_rate
            
        predicted_fill_24h = b.current_fill_percent + (fill_rate * settings.prediction_horizon_hours)
        
        # Calculate overflow probability based on ETA and historical variance (simplified here for heuristic approach)
        if b.current_fill_percent >= settings.overflow_threshold:
            probability = 1.0
        elif eta_hours <= 12:
            probability = 0.5 + (0.5 * (12 - eta_hours) / 12)
        elif eta_hours <= 24:
            probability = 0.2 + (0.3 * (24 - eta_hours) / 12)
        else:
            probability = max(0.01, min(0.2, (predicted_fill_24h / 100.0) * 0.2))
            
        # Risk levels
        if b.current_fill_percent >= settings.overflow_threshold or eta_hours < 4:
            risk = RiskLevel.CRITICAL
            explanation = f"Critical: Fill is {b.current_fill_percent:.1f}% and expected to overflow in {eta_hours:.1f} hours."
        elif b.current_fill_percent >= settings.overflow_threshold * 0.8 or eta_hours < 12:
            risk = RiskLevel.HIGH
            explanation = f"High: Fast accumulation. Expected overflow in {eta_hours:.1f} hours."
        elif b.current_fill_percent >= settings.overflow_threshold * 0.5 or eta_hours < 24:
            risk = RiskLevel.MEDIUM
            explanation = f"Medium: Steady fill. Projected overflow within {eta_hours:.1f} hours."
        else:
            risk = RiskLevel.LOW
            explanation = "Low: Normal operations."

        # Priority score (0-100)
        # Factors: Current fill (40%), Overflow Probability (40%), ETA urgency (20%)
        fill_score = min(100.0, b.current_fill_percent) * 0.4
        prob_score = probability * 100.0 * 0.4
        eta_score = max(0, min(100.0, (48 - eta_hours) / 48 * 100)) * 0.2
        priority = fill_score + prob_score + eta_score

        predictions[b.id] = PredictionSchema(
            bin_id=b.id,
            predicted_fill=predicted_fill_24h,
            overflow_probability=probability,
            overflow_eta_hours=eta_hours,
            confidence=0.85, # Fixed confidence for heuristic
            risk_level=risk,
            priority_score=priority,
            risk_explanation=explanation
        )
        
    return predictions
