from django.urls import path

from . import views


urlpatterns = [
    path("", views.home, name="home"),

    # Auth routes
    path("auth/register/", views.register, name="register"),
    path("auth/login/", views.login, name="login"),
    path(
        "auth/google/",
        views.GoogleAuthView.as_view(),
        name="google-auth",
    ),
    path("auth/logout/", views.logout, name="logout"),
    path("auth/me/", views.me, name="me"),

    # Profiles
    path(
        "profiles/<int:id>/",
        views.public_profile,
        name="public-profile",
    ),

    # Carpools
    path(
        "carpools/",
        views.carpool_list,
        name="carpool-list",
    ),
    path(
        "carpools/create/",
        views.carpool_create,
        name="carpool-create",
    ),
    path(
        "carpools/<int:id>/",
        views.carpool_detail,
        name="carpool-detail",
    ),
    path(
        "carpools/<int:id>/join/",
        views.carpool_join,
        name="carpool-join",
    ),

    # Matches
    path(
        "matches/",
        views.get_matches,
        name="get-matches",
    ),

    # Events
    path(
        "events/",
        views.event_list,
        name="event-list",
    ),
    path(
        "events/<int:id>/",
        views.event_detail,
        name="event-detail",
    ),
    path(
        "events/gallery/<int:id>/",
        views.event_gallery_image_delete,
        name="event-gallery-delete",
    ),

    # Public profiles
    path(
        "profiles/<int:user_id>/",
        views.public_profile,
        name="public-profile",
    ),
]