import { OWNER_META, SITE_META } from './config/siteMeta';

/**
 * Ownership assertion shipped inside the bundle. It deters casual
 * copying (console notice + About credit) and documents willfulness
 * if notices are stripped. It cannot stop a determined copier:
 * client-side code is inherently readable.
 */
const NOTICE =
  `%c${SITE_META.name} — proprietary software (c) 2026 ${OWNER_META.name}. ` +
  `All rights reserved. Unauthorized use, copying or redistribution is ` +
  `prohibited (see LICENSE). Contact: ${OWNER_META.email}`;

let printed = false;

export function printOwnershipNotice(): void {
  if (printed) return;
  printed = true;
  try {
    console.warn(NOTICE, 'font-weight: bold;');
  } catch {
    // Console must never break the stage.
  }
}
