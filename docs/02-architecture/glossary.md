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

## Playlist and deck

A playlist is an ordered sequence of scene occurrences; the same scene
may appear more than once. Positions 1-10 form the quick-access deck
and map to Digit1-Digit9 and Digit0, so position IS the shortcut:
arrows renumber shortcuts, and starring pins the occurrence into the
deck (unstarring drops it past position 10). Console lists collapse to
the deck with a full-list toggle.

## Guide

Help. The interactive drawer and first-run tour live on the deck; the
Console popup carries the same compact teaser, firing remote commands
so the guide and the tour open on the main deck window.
