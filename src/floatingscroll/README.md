# floatingscroll

### The Crux of the Matter

The general purpose of the plugin is to provide some lengthy containers on the page with a separate horizontal scroll bar, which does not vanish from sight when the entire page is scrolled. So, the user will always be able to scroll the container even if its own scroll bar is hidden from view.

Moreover, the plugin displays such an additional floating scroll bar only in case of actual need, i.e. the floatingscroll does not result in unnecessary scroll bar duplication. So, one uses the floating scroll bar only if the native one is out of sight.

### Details & API

There is the only public method used to instantiate a floating scroll — `.attachScroll()`. The method does not take parameters and it should be called in context of a scrollable container.

The plugin registers the `adjustScroll` event type used to update the size and position of the floating scroll bar in case of dynamically changed content. Trigger `adjustScroll` event on the container the floating scroll is attached to.

### Examples

The only thing required to apply the floatingscroll to a static container (whose sizes will never change during the session) is a single call to the `.attachScroll()` method on the DOM ready event:

```javascript
    $(document).ready(function () {
        $(".spacious-container").attachScroll();
    });
```

If you attach a floating scroll bar to a container whose size and/or content may dynamically change, then you need a way to update the scroll bar each time the container changes. This can be performed by triggering the custom `adjustScroll` event on the target container.

```javascript
    $(".spacious-container").attachScroll();
    $("#refresh-button").click(function () {
        // ... some actions which change the total scroll width of the container ...
        $(".spacious-container").trigger("adjustScroll");
    });
```

### Live demos

You may find some demos of use the floatingscroll plugin [here](http://amphiluke.github.io/jquery-plugins/floatingscroll/).
