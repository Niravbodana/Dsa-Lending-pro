"""Default homepage CMS configuration — editable via Admin Site Builder."""

DEFAULT_SITE_CONFIG: dict = {
    "hero": {
        "badge": "RBI LSP Registered · India's Premium Loan Marketplace",
        "headline_line1": "Dream Big.",
        "headline_highlight": "Borrow Smart.",
        "headline_sub": "Up to ₹10,00,000 — approved in 5 minutes.",
        "description": "Neer Loan Solutions brings you personalized offers from HDFC, ICICI, Bajaj & 15+ trusted lenders. Zero branch visit. Money directly in your account.",
        "bullet_points": [
            "Wedding, home, medical, travel — every dream funded",
            "Lowest ROI from 10.99% — compare & choose the best",
            "100% digital — OTP to disbursal on your phone",
        ],
        "cta_primary": "Get My Loan Offer — Free",
        "cta_secondary": "Check Eligibility",
        "image_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=750&fit=crop&crop=faces",
        "testimonial_quote": "₹5 lakh approved while I was having chai. Unbelievable!",
        "testimonial_author": "Rahul Mehta, Bangalore",
        "approval_card_label": "Just Approved",
        "approval_card_amount": "₹4,80,000",
        "roi_badge": "10.99%",
        "roi_badge_label": "Starting ROI",
    },
    "stats": [
        {"value": "₹10L+", "label": "Max Loan"},
        {"value": "10.99%", "label": "Lowest ROI"},
        {"value": "5 Min", "label": "Fast Approval"},
        {"value": "50K+", "label": "Happy Customers"},
    ],
    "urgency_bar": {
        "enabled": True,
        "text": "847 people applied for a loan today — Limited slots at lowest rates",
        "emoji": "🔥",
    },
    "promo_strip": {
        "enabled": True,
        "text": "ZERO processing fee on first loan — Offer ends soon",
        "highlight": "ZERO processing fee",
    },
    "social_proof": {
        "enabled": True,
        "viewers_base": 142,
        "label": "people comparing loan offers right now",
    },
    "dream_section": {
        "title": "Your Dreams Deserve the Best Rate",
        "subtitle": "Whether it's a dream wedding, your child's education, or expanding your business — we make borrowing feel effortless.",
        "cards": [
            {
                "title": "Dream Wedding",
                "desc": "Venue, jewellery, honeymoon — fund it all",
                "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
                "cta": "Wedding Loan",
            },
            {
                "title": "Dream Home",
                "desc": "Renovation, deposit, interiors made easy",
                "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
                "cta": "Home Loan",
            },
            {
                "title": "Dream Business",
                "desc": "Inventory, equipment, working capital",
                "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
                "cta": "Business Loan",
            },
        ],
    },
    "theme": {
        "accent": "teal",
        "hero_style": "premium",
    },
    "sections": {
        "urgency_bar": True,
        "promo_strip": True,
        "social_proof": True,
        "dream_section": True,
        "metrics_ticker": True,
        "emi_calculator": True,
        "testimonials": True,
    },
}
