from django.core.exceptions import ValidationError

ALLOWED_EMAIL_DOMAIN = "@my.csun.edu"


def validate_csun_email(value):
    """Reject any email that isn't a CSUN student address.

    The React form checks this too, but anyone can bypass the browser and
    POST straight to the API, so the server has to check it as well.
    """
    if not value.lower().endswith(ALLOWED_EMAIL_DOMAIN):
        raise ValidationError(
            f"You must register with a valid {ALLOWED_EMAIL_DOMAIN} email."
        )
