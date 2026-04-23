# AniList Unicodifier Direct

This Chrome extension directly targets AniList's status composer textarea:

```html
<textarea autocomplete="off" placeholder="Write a status..." class="el-textarea\_\_inner"></textarea>
```

## What it does

* watches the AniList status textarea directly
* on input/paste/blur/save click, transforms unsupported 4-byte Unicode characters
* default mode encodes them as numeric HTML entities, e.g. 😄 -> \&#128516; -> Sent (😄)
* optional remove mode strips them completely

## Why this version exists

Earlier versions tried to intercept submit/network flows. AniList's reactive UI can bypass those. This one edits the textarea value itself so you can see the transformation happen.

## Install

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder

## Notes

* The textarea will show entity codes after conversion. That is expected.
* Whether AniList later renders those entities as emoji depends on AniList.

