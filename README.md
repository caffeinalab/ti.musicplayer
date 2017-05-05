# Ti.MusicPlayer

### com.caffeinalab.titanium.musicplayer

A simple **Music player** widget.

![image](https://cl.ly/3U2p0c3i0g3s/Image%202017-04-28%20at%204.58.55%20PM.png)

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
var mp = Alloy.createWidget('com.caffeinalab.titanium.musicplayer');
mp.setPlaylist([{
    id: "",
    url: 'http://google.com',
    cover: "http://google.com",
    artist: "",
    album: "",
    track: 1
}]);
mp.setPlaylistIndex(0);
mp.play()
```

## API

The `Track` object is:

* `id`: Usually the model id but can be whatever you want. It is not used internally but it is recommended.
* `url`: The link to the audio.
* `cover`: Link to the cover image.
* `artist`: The artist of the sound track.
* `album`: The album where the sound track is featured.
* `index`: Track index

#### `play() `

Play current track.

#### `stop()`

Stops the currently playing audio and releases the memory.

#### `pause()`

Pauses the currently playing audio.

#### `setPlaylist(Track[])`

Set the playlist to use in the player.

#### `setPlaylistIndex(Number)`

Set the current index track in the playlist

#### `deletePlaylist`

Delete the current playlist. You can use `setTrack` to set a single track to play.

#### `setTrack(Track)`

Override the current track.

## Events

#### `play`

Fired when the play function is called either from the widget's UI or programmatically

Passed arguments:

* `Track`

#### `pause`

Fired when the pause function is called either from the widget's UI or programmatically

Passed arguments:

* `Track`

#### `stop`

Fired when internally when the music reaches the end or when the stop function is called programmatically

#### `progress`

Fired continuously while the music is playing.

Passed arguments:

* `Track`
