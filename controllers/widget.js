var WNAME = 'com.caffeinalab.titanium.musicplayer';

/*
Pragma private
*/

var args 		= arguments[0] || {};
var nowPlaying = OS_IOS ? Util.requireOrNull('com.guidolim.TiNowPlaying') : null;
var EVENTS 		= ["play", "pause", "stop", "stopped", "progress", "stopall"];
var LISTENERS	= {};
var E_Bounce 	= [];
var E_PREF 		= "musicplayer.";
var height 		= 70;
var ap_has_listener = false;

Titanium.Media.audioSessionCategory = Titanium.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;

$.playlist = [];
$.playlistIndex = 0;
$.track = null;
$.playing = false;
$.audioPlayer = {};

function getLocalCoverName() {
	return Ti.Utils.md5HexDigest($.track.cover) + $.track.cover.match(/\.\w+$/).pop();
}

function getLocalCover() {
	return Ti.Filesystem.getFile(getLocalDir().resolve(), getLocalCoverName());
}

function getLocalDir() {
	var dir = Ti.Filesystem.getFile(Util.getAppDataDirectory(), 'audio');
	if (!dir.exists()) dir.createDirectory();
	return dir;
}

function downloadCover(progressHandler) {
	return Q.promise(function(resolve, reject) {
		if (isDownloadedCover()) return resolve();
		HTTP.download($.track.cover, getLocalCover(), resolve, reject, progressHandler);
	});
}

function isDownloadedCover() {
	return getLocalCover().exists();
}

function getCover() {
	if (!isDownloadedCover()) return $.track.cover;
	else return getLocalCover().resolve();
}

function getCoverNativePath() {
	if (!isDownloadedCover()) return false;
	else return getLocalCover().nativePath;
}


//////////////
// Handlers //
//////////////

function remoteControlsHandler(e) {
	switch (e.action) {
		case nowPlaying.PLAY:
		$.play();
		break;
		case nowPlaying.PAUSE:
		$.pause();
		break;
		case nowPlaying.STOP:
		$.stop();
		break;
		case nowPlaying.NEXT:
		$.next();
		break;
		case nowPlaying.PREV:
		$.prev();
		break;
	}
}

function setUI() {
	// Update our UI strings
	if ($.track == null) {
		$.lbltitle.text = "";
		$.lbltrack.text = "";
	} else {
		if ($.track.title != $.lbltitle.text) {
			$.lbltitle.text = ($.track.title || "").toUpperCase();
		}
		if ($.track.artist != $.lbltrack.text) {
			$.lbltrack.text = ($.track.artist ? $.track.artist : (L("track") + " " + $.track.index)).toUpperCase();
		}
	}

	// Update our UI
	if ($.track == null) {
		$.music_player.height = 0;
	} else {
		$.music_player.height = height;
	}

	if ($.playing) {
		$.playBtn.image = WPATH("/images/pause.png");
	} else {
		$.playBtn.image = WPATH("/images/play.png");
	}
}

function setInfo() {
	// Set url for Player
	if ($.track != null) {
		Event.trigger("musicplayer.seturl", $.track.url);
	}

	// Update Music player info
	if (nowPlaying) {
		if ($.track == null) {
			nowPlaying.clear();
		} else {
			downloadCover()
			.then(function() {		
				nowPlaying.setInfo({
					artistName: $.track.artist,
					songTitle: $.track.title,
					albumTitle: $.track.album,
					albumCover: getCoverNativePath()
				});
			});
		}
	}
}

function stop() {
	if (!$.playing) return;
	$.playing = false;
	Event.trigger("musicplayer.stop", {});
	$.trigger("stop");
	$.playBtn.image = WPATH("/images/play.png");
}

function play() {
	if ($.track == null) {
		return Ti.API.warn(WNAME, "Song not set");
	}

	$.playing = true;
	Event.trigger("musicplayer.play", {});
	$.trigger("play", $.track);
	$.playBtn.image = WPATH("/images/pause.png");
}

function pause() {
	if (!$.playing) return;
	$.playing = false;
	Event.trigger("musicplayer.pause", {});
	$.trigger("pause", $.track);
	$.playBtn.image = WPATH("/images/play.png");
}

function toggle() {
	if ($.playing) {
		pause();
	} else {
		play();
	}
}

function progressToPercent(progress, duration) {
	if (duration === 0) return 0;
	return (progress / duration) * 100;
}

function audioProgressHandler(e) {
	if ($.track == null) return;

	$.track = _.extend($.track, {
		percentage: progressToPercent(e.progress, e.duration),
		progress: e.progress,
		new: e.url == $.track.url
	});

	$.progressbar.width = $.track.percentage + "%";
	if ($.track.percentage > 98) $.stop();

	$.trigger("progress", $.track);
}

// function setListeners() {
// 	if(Object.getOwnPropertyNames(LISTENERS).length > 0) return;
// 	EVENTS.forEach(function(k) {
// 		var functions = Object.getOwnPropertyNames($).filter(function(k) { 
// 			return _.isFunction($[k]);
// 		});
// 		if (functions.indexOf(k) != -1) {
// 			LISTENERS[k] = function(e) {
// 				if (_.isFunction($[k])) $[k](_.extend(e, {__through_event: true}));
// 			};
// 			$.on(k, LISTENERS[k]);
// 		}
// 	});
// }

/*
Listeners
*/

$.playBtn.addEventListener("click", function(){ $.toggle(); });

/*
Pragma public
*/

/**
 * @method play
 */
$.play = play;

/**
 * @method pause
 */
$.pause = pause;

/**
 * @method toggle
 */
$.toggle = toggle;

/**
 * @method next
 */
$.next = function() {
	var playMode = $.getPlayMode();
	if (playMode === 'PLAYLIST') {
		$.playlistIndex++;
		if ($.playlistIndex >= $.playlist.length) {
			$.playlistIndex = 0;
			$.stop();
		} else {
			$.setTrack($.playlist[ $.playlistIndex ]);
		}
	} else if (playMode === 'SONG') {
		$.stop();
	}

	// If the player is playing, keep playing
	if ($.playing) {
		$.play();
	}
};

/**
 * @method prev
 */
$.prev = function() {
	var playMode = $.getPlayMode();

	if (Musicplayer.instance.progress > 5000) $.playlistIndex++;

	if (playMode === 'PLAYLIST') {
		$.playlistIndex--;
		if ($.playlistIndex < 0) {
			$.playlistIndex = 0;
			$.stop();
		} else {
			$.setTrack($.playlist[ $.playlistIndex ]);
		}
	} else if (playMode === 'SONG') {
		$.stop();
	}

	// If the player is playing, keep playing
	if ($.playing) {
		$.play();
	}
};

/**
 * @method stop
 */
$.stop = function() {
	$.playBtn.image = WPATH("/images/play.png");
	$.music_player.height = 0;
	$.track = null;
	setUI();
	setInfo();
	stop();
};

$.cleanup = function() {
	//$.audioPlayer.removeEventListener("progress", audioProgressHandler);
};

$.show = function() {
	$.music_player.bottom = args.bottom || 0;
};

$.hide = function() {
	$.music_player.bottom = -Alloy.Globals.SCREEN_HEIGHT;
};

$.setPlaylistIndex = function(idx) {
	if (idx == $.playlistIndex && $.track != null) return;
	$.playlistIndex = idx;
	$.setTrack($.playlist[ $.playlistIndex ]);
};

$.setPlaylist = function(playlist) {
	$.playlist = playlist;
};

$.deletePlaylist = function() {
	$.playlist = null;
};

$.setTrack = function(obj) {
	$.track = obj;
	Ti.API.debug(WNAME, 'new track', obj);
	setUI();
	setInfo();
};

$.getPlayMode = function() {
	return _.isEmpty($.playlist) ? 'SONG' : 'PLAYLIST';
};

if (nowPlaying != null) {
	nowPlaying.addEventListener("RemoteControl", remoteControlsHandler);
}

if (Alloy.Globals.__comcaffeinatitaniummusicplayer) {
	['audioPlayer', 'track', 'playing', 'playlist', 'playlistIndex'].forEach(function(k) {
		$[k] = Alloy.Globals.__comcaffeinatitaniummusicplayer[k];
	});
	Alloy.Globals.__comcaffeinatitaniummusicplayer.cleanup();
} else {
	/*$.audioPlayer = Ti.Media.createAudioPlayer({
		allowBackground: true
	});*/
}

Event.on("musicplayer.progress", audioProgressHandler);
setUI();

Alloy.Globals.__comcaffeinatitaniummusicplayer = $;
