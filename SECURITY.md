# Security Policy

## Supported versions

Security fixes target the latest maintained major release. The historical v1 branch is maintained only for critical fixes that can be applied safely while v2 is being stabilized.

## Reporting a vulnerability

Please use GitHub private vulnerability reporting when available. Do not publish exploit details in a public issue before a fix is available.

Include the affected version, reproduction steps, impact and any mitigation you have tested.

## Security boundaries

Summernote Bricks operates inside a WYSIWYG editing surface and can compose HTML-producing plugins. Applications are responsible for server-side validation and sanitization of persisted/rendered editor HTML. Plugin-side validation is not a security boundary.
