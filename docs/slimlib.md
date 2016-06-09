## Classes

<dl>
<dt><a href="#Config">Config</a></dt>
<dd><p>Configuration class for SlimView to operate with.</p>
</dd>
<dt><a href="#MessageChannel">MessageChannel</a></dt>
<dd></dd>
<dt><a href="#Channel">Channel</a></dt>
<dd><p>Channel is responsible for handling</p>
<ul>
<li>secrutiy</li>
<li>opening/closing it</li>
<li>sending and routing messages to and from SlimView</li>
</ul>
</dd>
</dl>

<a name="Config"></a>

## Config
Configuration class for SlimView to operate with.

**Kind**: global class  

* [Config](#Config)
    * [.endpoint](#Config+endpoint) : <code>string</code>
    * [.token](#Config+token) : <code>string</code>
    * [.previewPage](#Config+previewPage) : <code>string</code>
    * [.targetLanguage](#Config+targetLanguage) : <code>string</code>
    * [.projectCode](#Config+projectCode) : <code>string</code>
    * [.extra](#Config+extra) : <code>Map.&lt;String, String&gt;</code>

<a name="Config+endpoint"></a>

### config.endpoint : <code>string</code>
SlimView's endpoint

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="Config+token"></a>

### config.token : <code>string</code>
Access Token

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="Config+previewPage"></a>

### config.previewPage : <code>string</code>
Page to load SlimView with

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="Config+targetLanguage"></a>

### config.targetLanguage : <code>string</code>
Language of the Preview

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="Config+projectCode"></a>

### config.projectCode : <code>string</code>
Project code to load the SlimView for

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="Config+extra"></a>

### config.extra : <code>Map.&lt;String, String&gt;</code>
Extra parameters to pass to SlimView

**Kind**: instance property of <code>[Config](#Config)</code>  
<a name="MessageChannel"></a>

## MessageChannel
**Kind**: global class  

* [MessageChannel](#MessageChannel)
    * [new MessageChannel(config)](#new_MessageChannel_new)
    * [.slimviewRef](#MessageChannel+slimviewRef) : <code>Window</code>
    * [.start(onError, onMessage)](#MessageChannel+start)
    * [.stop()](#MessageChannel+stop)
    * [._validateMessageSource(ev)](#MessageChannel+_validateMessageSource) ⇒ <code>boolean</code>

<a name="new_MessageChannel_new"></a>

### new MessageChannel(config)

| Param | Type |
| --- | --- |
| config | <code>[Config](#Config)</code> | 

<a name="MessageChannel+slimviewRef"></a>

### messageChannel.slimviewRef : <code>Window</code>
SlimView's window

**Kind**: instance property of <code>[MessageChannel](#MessageChannel)</code>  
<a name="MessageChannel+start"></a>

### messageChannel.start(onError, onMessage)
Starts SlimView
Opens it in a new window, start listening to messages and goes through the handshake

**Kind**: instance method of <code>[MessageChannel](#MessageChannel)</code>  

| Param | Type |
| --- | --- |
| onError | <code>[errorCallback](#Channel..errorCallback)</code> | 
| onMessage | <code>[messageCallback](#Channel..messageCallback)</code> | 

<a name="MessageChannel+stop"></a>

### messageChannel.stop()
Closes SlimView and stops listening for messages

**Kind**: instance method of <code>[MessageChannel](#MessageChannel)</code>  
<a name="MessageChannel+_validateMessageSource"></a>

### messageChannel._validateMessageSource(ev) ⇒ <code>boolean</code>
Validates that the message arrived from the window
MessageChannel opened and that the origin of it matches
SlimView's.

**Kind**: instance method of <code>[MessageChannel](#MessageChannel)</code>  

| Param | Type |
| --- | --- |
| ev | <code>MessageEvent</code> | 

<a name="Channel"></a>

## Channel
Channel is responsible for handling
 - secrutiy
 - opening/closing it
 - sending and routing messages to and from SlimView

**Kind**: global class  

* [Channel](#Channel)
    * _instance_
        * [._config](#Channel+_config) : <code>[Config](#Config)</code>
        * [.config](#Channel+config) : <code>[Config](#Config)</code>
        * [.isOpen](#Channel+isOpen) ⇒ <code>boolean</code>
        * [.window](#Channel+window) ⇒ <code>Window</code> &#124; <code>\*</code>
        * [.openInNewWindow()](#Channel+openInNewWindow)
        * [.close()](#Channel+close)
        * [.onError(callback)](#Channel+onError)
        * [.onMessage(callback)](#Channel+onMessage)
        * [.highlight(id)](#Channel+highlight)
        * [.find(fragment)](#Channel+find)
        * [.translate(id, translation, save)](#Channel+translate)
        * [.navigate(previewUrl)](#Channel+navigate)
        * [.enableHighlighting()](#Channel+enableHighlighting)
        * [.disableHighlighting()](#Channel+disableHighlighting)
    * _inner_
        * [~errorCallback](#Channel..errorCallback) : <code>function</code>
        * [~messageCallback](#Channel..messageCallback) : <code>function</code>

<a name="Channel+_config"></a>

### channel._config : <code>[Config](#Config)</code>
**Kind**: instance property of <code>[Channel](#Channel)</code>  
<a name="Channel+config"></a>

### channel.config : <code>[Config](#Config)</code>
**Kind**: instance property of <code>[Channel](#Channel)</code>  
<a name="Channel+isOpen"></a>

### channel.isOpen ⇒ <code>boolean</code>
Is SlimView window opened?

**Kind**: instance property of <code>[Channel](#Channel)</code>  
<a name="Channel+window"></a>

### channel.window ⇒ <code>Window</code> &#124; <code>\*</code>
Window reference for the SlimView

**Kind**: instance property of <code>[Channel](#Channel)</code>  
<a name="Channel+openInNewWindow"></a>

### channel.openInNewWindow()
Opens SlimView with provided configuration

**Kind**: instance method of <code>[Channel](#Channel)</code>  
<a name="Channel+close"></a>

### channel.close()
Stops listening on message events and closes the SlimView window

**Kind**: instance method of <code>[Channel](#Channel)</code>  
<a name="Channel+onError"></a>

### channel.onError(callback)
Register callback function to invoke when an error message arrives from SlimView

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type |
| --- | --- |
| callback | <code>[errorCallback](#Channel..errorCallback)</code> | 

<a name="Channel+onMessage"></a>

### channel.onMessage(callback)
Callback that is invoked when a message arrives from SlimView

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type |
| --- | --- |
| callback | <code>[messageCallback](#Channel..messageCallback)</code> | 

<a name="Channel+highlight"></a>

### channel.highlight(id)
Highlight an entry in SlimView

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the Segment to highlight |

<a name="Channel+find"></a>

### channel.find(fragment)
Instruct SlimView to perfoem a search for given content fragment

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| fragment | <code>string</code> | Fragment to search for |

<a name="Channel+translate"></a>

### channel.translate(id, translation, save)
Send a translation to SlimView

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the Segment to highlight |
| translation | <code>string</code> | Translation to replace current content with |
| save | <code>boolean</code> | Attempt to save translation in Easylnig |

<a name="Channel+navigate"></a>

### channel.navigate(previewUrl)
Navigate SlimView to a different page

**Kind**: instance method of <code>[Channel](#Channel)</code>  

| Param | Type |
| --- | --- |
| previewUrl | <code>string</code> | 

<a name="Channel+enableHighlighting"></a>

### channel.enableHighlighting()
Highlighting will be enabled in SlimView

**Kind**: instance method of <code>[Channel](#Channel)</code>  
<a name="Channel+disableHighlighting"></a>

### channel.disableHighlighting()
Highlighting will be disabled in SlimView - users can navigate between pages

**Kind**: instance method of <code>[Channel](#Channel)</code>  
<a name="Channel..errorCallback"></a>

### Channel~errorCallback : <code>function</code>
**Kind**: inner typedef of <code>[Channel](#Channel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Map</code> | data |

<a name="Channel..messageCallback"></a>

### Channel~messageCallback : <code>function</code>
**Kind**: inner typedef of <code>[Channel](#Channel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Map</code> | data |

