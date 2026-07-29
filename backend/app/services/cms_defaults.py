"""Default homepage CMS configuration — editable via Admin Site Builder."""

DEFAULT_SITE_CONFIG: dict = {
    "hero": {
        "badge": "RBI LSP Registered · Premium Marketplace",
        "headline_line1": "Dream Big.",
        "headline_highlight": "Borrow Smart.",
        "headline_sub": "Personal loans up to ₹10,00,000",
        "description": "Compare curated offers from HDFC, ICICI, Bajaj and 15+ regulated lenders — one transparent platform, zero branch visits.",
        "bullet_points": [
            "Wedding, home, medical, travel — tailored loan options",
            "Rates from 10.99% p.a. — compare and choose with clarity",
            "End-to-end digital journey from eligibility to disbursal",
        ],
        "cta_primary": "Get My Loan Offer",
        "cta_secondary": "View Interest Rates",
        "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces",
        "testimonial_quote": "Business expansion ke liye loan liya. Teen NBFC offers compare karke best EMI choose ki — poora process office se phone par ho gaya.",
        "testimonial_author": "Ananya Mehta, Mumbai",
        "approval_card_label": "Loan Disbursed",
        "approval_card_amount": "₹4,80,000",
        "roi_badge": "10.99%",
        "roi_badge_label": "From",
    },
    "stats": [
        {"value": "₹10L+", "label": "Max Loan"},
        {"value": "10.99%", "label": "Lowest ROI"},
        {"value": "5 Min", "label": "Fast Approval"},
        {"value": "50K+", "label": "Happy Customers"},
    ],
    "urgency_bar": {
        "enabled": False,
        "text": "",
        "emoji": "",
    },
    "promo_strip": {
        "enabled": False,
        "text": "",
        "highlight": "",
    },
    "social_proof": {
        "enabled": False,
        "viewers_base": 0,
        "label": "",
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
                "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop",
                "cta": "Business Loan",
            },
        ],
    },
    "theme": {
        "accent": "teal",
        "hero_style": "premium",
    },
    "sections": {
        "urgency_bar": False,
        "promo_strip": False,
        "social_proof": False,
        "dream_section": True,
        "metrics_ticker": True,
        "emi_calculator": True,
        "testimonials": True,
    },
}
