# fix-ie-css-limit

### The Crux of the Matter

The jQuery UI extratabs widget extends the standard [UI tabs](http://jqueryui.com/tabs/) functionality with new features and options like thumbnails, tabs scrolling and multiline. Extratabs widget also inherits all the standard tabs functionality since it uses `$.ui.tabs` as a prototype.

### Options

Current plugin version exposes two essential features which may be applied to tabs widget:

* **thumbnails** appearing while the user hovers the mouse pointer over a tab (very much like tabs behavior in Opera browser)
* **multiline** tabs and tabs **scrolling**, the features making better look and feel of the widget when the total tabs width exceeds the widget width

The options `thumbnails` and `multiline` are both boolean (default to `false`), and they indicate whether or not to activate corresponding features. If the `multiline` option is not specified or it is set to `false` then the widget will not have tabs on several rows. Instead, all the tabs will be wrapped with a scrollable container, and scroll buttons will appear (if there is not enough room for all the tabs).

Note that multiline tabs are incompatible with fluid tabs layout, so use the `multiline` option with fixed width containers only.

If the `thumbnals` option is on, you may change the delay before a thumbnail will appear when the mouse pointer hovers over a tab. Use the `thumbDelay` option for this purpose; it is measured in milliseconds and is set to 150 by default.

Here is an example of the widget initialization:

```javascript
    $("#tabs").extratabs({
        thumbnails: true,
        multiline: true
    });
```

### Live demo

[Here](http://diapeira.1gb.ru/diapeira/jquery-plugins/extratabs.html), you may find a live demo and play with widget options.
