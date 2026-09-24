# Glossary

Canonical vocabulary for the VJ Lab interface. These terms separate
*where things show* (Stage), *where they are driven from* (Console),
and *where they are prepared* (Library).

## Stage

The WebGL scene display only: canvas, scene badge, text and strobe
overlays. Untouched during a performance; `Hide UI` leaves the Stage
alone on the main screen.

## Console

The control surface: deck side panel, bottom sheet, and the mirrored
second-screen popup (`/controls`). Hosts second-scale performance
controls in canonical section order: Track, Scenes, Stage, Strobe,
Effects, Flags, Guide, Overlay and actions.

## Deck

The complete workstation: Stage plus Console. Served at `/deck`.

## Library

Preparation outside the performance flow: scene CRUD (builder and
editor), pack import and export, and the bases explorer. Opens as a
full-screen overlay above the living Stage, from the deck or remotely
from the Console popup. The Scenes console section stays lean: list
plus transport only.

## Guide

Help. The interactive drawer and first-run tour live on the deck; the
Console popup carries a static shortcut reference noting that
shortcuts and the tour run on the main deck window.
