"""Generates AI-powered portfolio insights using Claude."""

import json
import logging
import random

import anthropic

from models.insight import PortfolioInsight
from models.portfolio import Holding

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 256
TEMPERATURE = 0.7

INSIGHT_PROMPT = """Give a brief, factual market insight (1-2 sentences) about {name} ({ticker}) currently priced at ${price:.2f}, with a daily change of {change:+.2f}%.

Return ONLY valid JSON with exactly these fields:
- "headline": a short headline (5 words max, ALL CAPS)
- "body": 1-2 sentence insight about the asset

Example: {{"headline": "AAPL HITS NEW HIGHS", "body": "Apple reached a 52-week high driven by strong iPhone sales. Your position is up 13% since purchase."}}"""


async def generate_insight(
    holdings: list[Holding], api_key: str
) -> PortfolioInsight:
    """Pick a random holding and generate an AI insight about it."""
    holding = random.choice(holdings)

    client = anthropic.AsyncAnthropic(api_key=api_key)
    prompt = INSIGHT_PROMPT.format(
        name=holding.name,
        ticker=holding.ticker,
        price=holding.current_price,
        change=holding.daily_change_percent,
    )

    response = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text
    parsed = json.loads(text)

    return PortfolioInsight(
        ticker=holding.ticker,
        asset_name=holding.name,
        headline=parsed["headline"],
        body=parsed["body"],
    )
