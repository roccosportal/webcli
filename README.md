# webcli

This WebExtension provides a simple command line interface for Firefox to execute basic commands. You can open the small interface by pressing the shortcut `Ctrl+Shift+L`.

![](https://github.com/roccosportal/webcli/blob/master/preview.gif)

## requirements
Firefox version 48.0a1 or higher.

## status
Warning: this is not even alpha status. Probably a lot of bugs and and still under heavy changes.

## installation
You can test this extension by opening `about:debugging` as website. Click on `Load Temporary Add-on`. Browse to this extension and open the `manifest.json`. Now press `Ctrl+Shift+L` in any open tab.

## commands

### bookmarks
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

## more
Have a look at the [/docs](docs/basics.md)


## todos

* Add help command
* Add an open function to the bookmark command
