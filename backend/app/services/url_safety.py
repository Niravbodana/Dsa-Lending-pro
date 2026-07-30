"""Validate external URLs before persisting in CMS or user content."""

from urllib.parse import urlparse

ALLOWED_IMAGE_HOSTS = frozenset(
    {
        "images.unsplash.com",
        "plus.unsplash.com",
        "images.pexels.com",
        "cdn.pixabay.com",
    }
)


def is_safe_https_image_url(url: str) -> bool:
    """Allow only HTTPS image URLs from an approved host list."""
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return False
    if parsed.scheme != "https":
        return False
    if not parsed.netloc:
        return False
    host = parsed.netloc.lower().split(":")[0]
    return host in ALLOWED_IMAGE_HOSTS
