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

## Show

A timed playlist: ordered cues with their own total runtime, optionally
read against a loaded track or a manual target (coverage meter). Theater
/ QLab sense of "show". One play carries a full set ponta a ponta.

## Cue

One playlist occurrence: a scene reference plus its position, duration
and follow mode. Duration belongs to the cue (`key`), never to the
scene — the same scene may last 30 s as cue 2 and 3 min as cue 7.
Theater / QLab sense of "cue".

## Clock

The single time source driving auto-advance (and recorded events in the
future): audio position while a track plays, wall clock when the show
runs standalone. A discontinuity reads as a seek and rebases the show
onto the cue under the playhead.

## Takeover

Manual trigger during auto-playback (QLab GO style): the playhead moves
to the taken cue and the pilot continues from there. Manual never breaks
the automatic show, it redirects it.

## Burst

Momentary live impulse (`burst.fire`, B key): each base maps it to its
own declared response with decay (grandMA Flash-button sense). Declared
per base in the capability registry; recordable through the action
registry.

## Macro

One big knob driving several params (Ableton Macro / Resolume Dashboard
sense). Shape disclosure level: `Energy` (gain + speed) and `Breath`
(scale-pulse depth) ship first.

## Coverage

Show total vs a reference duration — loaded track, else manual target,
else the total alone — reading under / covered (±5 s) / over. The show
always has its own ruler, with or without a track.

## Pool

The interrupt favorites: the first 10 playlist positions (the deck,
Digit1–Digit0). Manual-only overlays off the timeline — the pilot never
auto-targets them. Triggering one holds the stage over the running body.

## Body

The timed show: playlist positions 11+, with windows from track 0:00.
Countdown, coverage and the timeline read the body. A show with 10 or
fewer cues has no body and stays pure manual.

## Resume

Explicit return gesture (Z key, Resume button): dissolves to the body
cue under the playhead and clears interrupts. Safe anytime — doubles
as a re-sync to the track point.
