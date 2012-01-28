import sys
import cairo, gi

DEFAULT_WIDTH = 800
DEFAULT_HEIGHT = 1024
MINIMUM_HEIGHT = 50
TIMEOUT_DELAY = 10 * 1000

USE_GTK2 = True

if USE_GTK2:
	gi.require_version('Gtk', '2.0')
	gi.require_version('Gdk', '2.0')
	gi.require_version('WebKit', '1.0')
from gi.repository import GLib, Gtk, Gdk, WebKit

if len(sys.argv) != 3:
	print 'usage: %s url filename'%sys.argv[0]
	sys.exit(-1)

uri, filename = sys.argv[1:]

for scheme in ('http://', 'https://', 'ftp://', 'file://'):
	if uri.startswith(scheme):
		break
else:
	uri = 'http://' + uri

window = Gtk.OffscreenWindow()
window.props.default_width = DEFAULT_WIDTH
view = WebKit.WebView()
settings = view.get_settings()
settings.props.auto_resize_window = True
settings.props.enable_plugins = False
view.set_settings(settings)
window.add(view)

def capture_window(window):
	w, h = window.get_size()
	if h < MINIMUM_HEIGHT:
		window.set_default_size(w, DEFAULT_HEIGHT)
		view.reload()
		return
	src = Gdk.cairo_create(window.get_window()).get_target()
	src.write_to_png(filename)
	Gtk.main_quit()

def load_cb(webview, pspec, window):
	if webview.get_load_status() == WebKit.LoadStatus.FINISHED:
		capture_window(window)

view.connect('notify::load-status', load_cb, window)
view.load_uri(uri)
window.show_all()

GLib.timeout_add(TIMEOUT_DELAY, Gtk.main_quit)

Gtk.main()
