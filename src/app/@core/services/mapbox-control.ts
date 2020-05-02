export class MapboxGLButtonControl {
  _className;
  _title;
  _caption;
  _eventHandler;
  _btn;
  _container;
  _map;

  constructor({
    className = "",
    title = "",
    eventHandler,
    caption = ""
  }) {
    this._className = className;
    this._title = title;
    this._eventHandler = eventHandler;
    this._caption = caption;
  }

  onAdd(map) {
    this._map = map;
    const btn = document.createElement("button");
    btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
    btn.type = "button";
    btn.title = this._title;
    btn.onclick = this._eventHandler;
    btn.innerHTML = this._caption;

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}