## general

This command allows you to add, move and remove bookmarks. The home folder will always be the `Other Bookmarks` folder.

Add current website as bookmark.

`bookmarks add`

Add current website as bookmark under folder. Non existent folder will be created on the fly.

`bookmarks add /lets/organize/stuff/`

Add current website as bookmark under folder and give it a title. Notice the missing `/` to mark the last part of the path as new title.

`bookmarks add /lets/organize/stuff/this-interesting-website`

Remove a bookmark.

`bookmarks remove /a-bookmark`

Remove a complete bookmark folder.

`bookmarks remove /lets/organize/`

Move a bookmark to a new folder. Non existent folder will be created on the fly.

`bookmarks move /lets/organize/stuff/this-interesting-website /to/a/new/place/`

And also change the title.

`bookmarks move /to/a/new/place/this-interesting-website /other-place/better-title`

## objects

### path
Represents a path.

| Value | Description |
| --- | --- |
| s |  The original string |
| parts | List of parts |
| isFolder | Represents if the path ends with an `/` or not |


### pathMatch
Represents a match for a given path. If not a match the closet bookmark will be return and if all fails the root bookmark.

| Value | Description |
| --- | --- |
| item |  The bookmark |
| level | The level of the returned bookmark. `-1` is root. Can differ to path.parts when not all parts exist and the last existing bookmark/folder is returned |
| itemPath | The path as string of the returned item |
| path | The original path object  |
| isMatch | Indicated if the item is the bookmark the orignal path object is pointing at |
