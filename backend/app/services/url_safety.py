"""Validate external URLs before persisting in CMS or user content."""

from urllib.parse import urlparse

ALLOWED_IMAGE_HOSTS = frozenset(
    {
        "images.unsplash.com",
        "images.pexels.com",
        "cdn.pixabay.com",
        "images.unsplash.com",
    }
)


def is_safe_https_image_url(url: str) -> bool:
    """Allow HTTPS image URLs from approved hosts, or local /images/ and /hero paths."""
    cleaned = url.strip()
    if cleaned.startswith("/images/") or cleaned.startswith("/hero"):
        return True
    try:
        parsed = urlparse(cleaned)
    except ValueError:
        return False
    if parsed.scheme != "https":
        return False
    if not parsed.netloc:
        return False
    host = parsed.netloc.lower().split(":")[0]
    return host in ALLOWED_IMAGE_HOSTS
