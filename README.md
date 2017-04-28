# Ti.MusicPlayer

### com.caffeinalab.titanium.musicplayer

A simple **Music player** widget

The widget uses [Trimethyl](https://github.com/CaffeinaLab/Trimethyl), so you **must** install Trimethyl to use it, or define your own custom drivers.

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
