const Mainloop = imports.mainloop;
const Lang = imports.lang;

DEFAULT_WIDTH = 800
DEFAULT_HEIGHT = 1024
MINIMUM_HEIGHT = 50
TIMEOUT_DELAY = 10 * 1000

USE_GTK2 = true

if (USE_GTK2) {
	imports.gi.versions.Gtk = '2.0'
	imports.gi.versions.Gdk = '2.0'
	imports.gi.versions.WebKit = '1.0'
}

const Gdk = imports.gi.Gdk
const Gtk = imports.gi.Gtk
const WebKit = imports.gi.WebKit

function WebPreview(url, filename) {
    this._init(url, filename);
}

WebPreview.prototype = {
	_init : function(url, filename) {
		this.win = new Gtk.OffscreenWindow()
		this.win.default_width = DEFAULT_WIDTH
		this.view = new WebKit.WebView()
		settings = this.view.get_settings()
		settings.auto_resize_window = true
		settings.enable_plugins = false
		this.view.set_settings(settings)
		this.win.add(this.view)

		this.view.connect('notify::load-status', Lang.bind(this, this.load_cb))

		this.view.load_uri(uri)
		this.win.show_all()
	},

	capture_window : function() {
		[w, h] = this.win.get_size()
		if (h < MINIMUM_HEIGHT) {
			this.win.set_default_size(w, DEFAULT_HEIGHT)
			this.view.reload()
			return
		}
		src = Gdk.cairo_create(this.win.get_window()).getTarget()
		src.writeToPNG(filename)
		Gtk.main_quit()
	},

	load_cb : function(o, pspec) {
		if (this.view.get_load_status() == WebKit.LoadStatus.FINISHED) {
			this.capture_window(this.win)
		}
	}
}

function main(args) {

	[uri, filename] = args

	schemes = ['http://', 'https://', 'ftp://', 'file://']
	has_invalid_scheme = true
	for (let i in schemes) {
		if (uri.search(schemes[i]) == 0) {
			has_invalid_scheme = false
			break
		}
	}

	if (has_invalid_scheme) {
		uri = 'http://' + uri
	}

	Gtk.init(null, 0);

	preview = new WebPreview(uri, filename)
	Mainloop.timeout_add(TIMEOUT_DELAY, Gtk.main_quit)

	Gtk.main()
}

if (ARGV.length == 2) {
	main(ARGV)
} else {
  print('usage: webpreview url filename')
}


