# Ti.MusicPlayer

### com.caffeinalab.titanium.musicplayer

A simple **Sharing** widget heavy inspired to **AirBnb**, with default drivers and the ability to add custom drivers to share.

The widget use [Trimethyl.Share](https://github.com/CaffeinaLab/Trimethyl), so you **must** install Trimethyl to use it, or define your own custom drivers.

![](http://cl.ly/image/0i092a3w2L1H/687474703a2f2f662e636c2e6c792f6974656d732f3365306e337132723059316f31673372334b30432f494d475f313138342e504e47_iphone5c_yellow_portrait.png)

## Installation

#### Via Gittio

```
gittio install com.caffeinalab.titanium.musicplayer
```

#### Via Github

Download the latest release, unzip in `app/widgets` and add in your *config.json*, under `dependencies`:

```json
"dependencies": {
    "com.caffeinalab.titanium.musicplayer": "*"
}
```

## Usage

```javascript
var mp = Alloy.createWidget('com.caffeinalab.titanium.musicPlayer');
mp.play({
	id: "",
	url: 'http://google.com',
	cover: "http://google.com",
	artist: "",
	album: "",
    track: 1
});
```

## API

#### `play(audioObject) `

The `audioObject` object

* `id`: Usually the model id but can be whatever you want. It is not used internally but it is recommended.
* `url`: The link to the audio.
* `cover`: Link to the cover image.
* `artist`: The artist of the sound track.
* `album`: The album where the sound track is featured.
* `track`: Track index

#### `stop()`

Stops the currently playing audio and releases the memory.

#### `pause()`

Pauses the currently playing audio.

## Events

#### `musicplayer.play`

Fired when the play function is called either from the widget's UI or programmatically

Passed arguments:

* `audioObject`

#### `musicplayer.pause`

Fired when the pause function is called either from the widget's UI or programmatically

Passed arguments:

* `audioObject`

#### `musicplayer.stop`

Fired when internally when the music reaches the end or when the stop function is called programmatically

Passed arguments:

* `audioObject`

#### `musicplayer.progress`

Fired continuously while the music is playing.

Passed arguments:

* `audioObject`
