SMASHBIRD — PRODUCT PHOTOS
==========================

Drop photos in this folder named after the product, then deploy the whole
folder to Netlify. The card picks them up on its own.

  The Melter                ->  the-melter.jpg
  Jalapeno Hatch            ->  jalapeno-hatch.jpg
  Birdhouse Tendies & Fries ->  birdhouse-tendies-fries.jpg
  Drty Secret VG            ->  drty-secret-vg.jpg

Rule: lower-case, accents stripped, "&" dropped, spaces become dashes, .jpg

Before deploying, resize to about 1200px on the long side. The site never
displays wider than roughly 700px, so anything larger is wasted download.

A product with no photo simply shows no photo — never a broken icon — so you
can add them a few at a time.

Photos live here because content.js has photos.source = 'local'. Switching that
to 'cloudinary' moves resolution to the Cloudinary account instead, and this
folder stops being used.
