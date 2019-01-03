(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./_engine/AnimatedSprite.ts":
/*!***********************************!*\
  !*** ./_engine/AnimatedSprite.ts ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./_engine/Dictionary.ts");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var TextureLoader_1 = __webpack_require__(/*! ./TextureLoader */ "./_engine/TextureLoader.ts");
var AnimatedSprite = /** @class */ (function (_super) {
    tslib_1.__extends(AnimatedSprite, _super);
    function AnimatedSprite() {
        var _this = _super.call(this) || this;
        _this.animations = new Dictionary_1.Dictionary();
        _this.currentSequence = null;
        /**
         *  Plays the animation sequence by name
         */
        _this.play = function (name, fps, loop) {
            if (loop === void 0) { loop = true; }
            if (!_this.currentSequence || _this.currentSequence.sequenceName !== name) {
                _this.resetAnimation();
                _this.currentSequence = _this.animations.get(name);
                _this.texture = _this.currentSequence.spriteSheet;
                _this.texture.frame = _this.currentSequence.frames[0];
                _this.isPlaying = true;
            }
            _this.fps = fps || _this.fps;
            _this.isLooping = loop;
        };
        _this.accumulator = 0;
        _this.isPlaying = false;
        _this.isLooping = false;
        _this.frameIndex = 0;
        _this.currentFps = 8;
        _this.pivot.set(0.5);
        _this.anchor.set(0.5);
        _this.scale.set(1, -1);
        return _this;
    }
    AnimatedSprite.prototype.addAnimations = function () {
        var _this = this;
        var sequences = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sequences[_i] = arguments[_i];
        }
        sequences.forEach(function (seq, idx) {
            _this.animations.set(seq.sequenceName, seq);
            //  if no clip exists create it from first animation sequence
            if (!_this.texture.valid && idx === 0) {
                _this.texture = seq.spriteSheet;
                _this.texture.frame = seq.frames[0];
            }
        });
    };
    AnimatedSprite.prototype.clearAnimations = function () {
        this.stop();
        this.currentSequence = null;
        this.animations.clear();
    };
    AnimatedSprite.prototype.onUpdate = function (dt) {
        if (this.isPlaying && this.texture.valid && this.currentSequence) {
            this.accumulator += dt;
            var secForFrame = 1000 / this.fps;
            if (this.accumulator > secForFrame) {
                this.accumulator -= secForFrame;
                this.texture.frame = this.currentSequence.frames[++this.frameIndex];
                if (this.frameIndex == this.currentSequence.frames.length - 1) {
                    this.frameIndex = 0;
                    //  end the animation if not looping
                    if (!this.isLooping) {
                        this.isPlaying = false;
                        if (this.onCompleteCallBack) {
                            this.onCompleteCallBack(this.currentSequence);
                        }
                    }
                }
            }
        }
    };
    Object.defineProperty(AnimatedSprite.prototype, "onComplete", {
        get: function () {
            return this.onCompleteCallBack;
        },
        set: function (cb) {
            this.onCompleteCallBack = cb;
        },
        enumerable: true,
        configurable: true
    });
    AnimatedSprite.prototype.stop = function () {
        this.isPlaying = false;
    };
    Object.defineProperty(AnimatedSprite.prototype, "fps", {
        get: function () {
            return this.currentFps;
        },
        set: function (fps) {
            this.currentFps = fps;
            if (fps < 2)
                debugger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "loop", {
        get: function () {
            return this.isLooping;
        },
        set: function (isLooping) {
            this.isLooping = isLooping;
        },
        enumerable: true,
        configurable: true
    });
    AnimatedSprite.prototype.resetAnimation = function () {
        this.stop();
        this.currentSequence = null;
        this.accumulator = 0;
        this.frameIndex = -1;
    };
    return AnimatedSprite;
}(PIXI.Sprite));
exports.AnimatedSprite = AnimatedSprite;
/*
 *   Creates textures for all individual frames of the sequence from the given texture atlas.
 */
var AnimationSequence = /** @class */ (function () {
    function AnimationSequence(sequenceName, spriteSheetName, frames, frameWidth, frameHeight) {
        if (frames === void 0) { frames = []; }
        var _this = this;
        this.sequenceName = sequenceName;
        this.frames = [];
        this.isAtlas = false;
        //let tempTexure : PIXI.Texture = PIXI.utils.TextureCache[spriteSheetName];
        var tempTexure = TextureLoader_1.TextureLoader.Get(spriteSheetName);
        this.isAtlas = tempTexure.frame.width != tempTexure.baseTexture.width || tempTexure.frame.height != tempTexure.baseTexture.height;
        this.spriteSheet = new PIXI.Texture(tempTexure.baseTexture);
        var xFrames = this.isAtlas ? Math.floor(tempTexure.frame.width / frameWidth) : Math.floor(this.spriteSheet.width / frameWidth);
        frames.forEach(function (frame) {
            var y = Math.floor(frame / xFrames);
            var x = frame % xFrames;
            var rect = null;
            if (_this.isAtlas) {
                rect = new PIXI.Rectangle(tempTexure.frame.x + x * frameWidth, tempTexure.frame.y + y * frameHeight, frameWidth, frameHeight);
            }
            else {
                rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            }
            _this.frames.push(rect);
        });
    }
    Object.defineProperty(AnimationSequence.prototype, "frameCount", {
        get: function () {
            return this.frames.length;
        },
        enumerable: true,
        configurable: true
    });
    return AnimationSequence;
}());
exports.AnimationSequence = AnimationSequence;


/***/ }),

/***/ "./_engine/Button.ts":
/*!***************************!*\
  !*** ./_engine/Button.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var filter_outline_1 = __webpack_require__(/*! @pixi/filter-outline */ "./node_modules/@pixi/filter-outline/lib/filter-outline.es.js");
var _1 = __webpack_require__(/*! . */ "./_engine/index.ts");
var OutlineMode;
(function (OutlineMode) {
    /**
     * The outline is backed in the buttons texture.
     * This looks excelent if the button's size matches the texture.
     * */
    OutlineMode[OutlineMode["Texture"] = 0] = "Texture";
    /**
     * The outline is created with the OutlineFilter.
     * Best to be used with small uniform textures (so scaling will not affect the texture).
     */
    OutlineMode[OutlineMode["Filter"] = 1] = "Filter";
})(OutlineMode = exports.OutlineMode || (exports.OutlineMode = {}));
var Button = /** @class */ (function (_super) {
    tslib_1.__extends(Button, _super);
    function Button(texturePath, x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 128; }
        if (height === void 0) { height = 32; }
        var _this = _super.call(this) || this;
        _this._outlineMode = OutlineMode.Filter;
        _this._isHighlighted = false;
        _this._isPressed = false;
        _this._isDisabled = false;
        _this._isClickStarted = false;
        _this.requestedWidth = 0;
        _this.requestedHeight = 0;
        _this.onButtonDown = function () {
            if (_this._isDisabled)
                return;
            _this._isClickStarted = true;
            _this.texture = _this.textureDown;
        };
        _this.onButtonUp = function (event) {
            if (_this._isDisabled)
                return;
            if (_this._isClickStarted) {
                _this._isClickStarted = false;
                _this.onClickHandler(event);
            }
            _this.applyTexture();
        };
        _this.onButtonUpOutside = function () {
            if (_this._isDisabled)
                return;
            _this.applyTexture();
            _this._isClickStarted = false;
        };
        _this.onButtonOver = function (event) {
            if (_this._isDisabled)
                return;
            _this.texture = _this.textureHighlight;
            if (_this.mouseover)
                _this.mouseover(event);
        };
        _this.onButtonOut = function (event) {
            if (_this._isDisabled)
                return;
            _this._isClickStarted = false;
            _this.applyTexture();
            if (_this.mouseout)
                _this.mouseout(event);
        };
        _this.position.set(x || 0, y || 0);
        _this.requestedHeight = height;
        _this.requestedWidth = width;
        //  setup button textures
        _this.setTexture(texturePath);
        _this.buttonMode = false;
        _this.interactive = true;
        _this.cursor = "hover";
        // set the mousedown and touchstart callback...
        _this.on('pointerdown', _this.onButtonDown);
        _this.on('pointerup', _this.onButtonUp);
        _this.on('pointerupoutside', _this.onButtonUpOutside);
        _this.on('pointerover', _this.onButtonOver);
        _this.on('pointerout', _this.onButtonOut);
        _this.isPressed = false;
        return _this;
    }
    Object.defineProperty(Button.prototype, "outlineMode", {
        get: function () {
            return this._outlineMode;
        },
        set: function (state) {
            this._outlineMode = state;
            this.filters = this._outlineMode == OutlineMode.Filter ? [new filter_outline_1.OutlineFilter(1, this._outlineColor, 0.5)] : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "outlineColor", {
        get: function () {
            return this._outlineColor;
        },
        set: function (value) {
            this._outlineColor = value;
            this.filters = this._outlineMode == OutlineMode.Filter ? [new filter_outline_1.OutlineFilter(1, this._outlineColor, 0.5)] : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "disabled", {
        get: function () {
            return this._isDisabled;
        },
        set: function (state) {
            this._isDisabled = state;
            this.cursor = state ? "" : "hover";
            this.applyTexture();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "isPressed", {
        get: function () {
            return this._isPressed;
        },
        set: function (state) {
            this._isPressed = state;
            this.applyTexture();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "isHighlighted", {
        get: function () {
            return this._isHighlighted;
        },
        set: function (state) {
            this._isHighlighted = state;
            this.applyTexture();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (text) {
            if (this._text) {
                this.removeChild(this._text);
            }
            this._text = text;
            if (this._text) {
                this._text.anchor.set(0.5, 0.5);
                var x = (this.width / this.scale.x) / 2;
                var y = (this.height / this.scale.y) / 2;
                this._text.position.set(x, y);
                this.addChild(this._text);
            }
        },
        enumerable: true,
        configurable: true
    });
    Button.prototype.onClickHandler = function (event) {
        if (!this.onClick) {
            console.warn("onClick() empty, did you forget to attach a handler?");
        }
        else {
            this.onClick(event);
        }
    };
    Button.prototype.applyTexture = function () {
        if (this._isDisabled) {
            this.texture = this.textureUp;
            this.tint = 0x606060;
        }
        else if (this._isHighlighted) {
            this.texture = this.textureHighlight;
            this.tint = 0x666666;
        }
        else {
            this.texture = this._isPressed ? this.textureDown : this.textureUp;
            this.tint = 0xffffff;
        }
    };
    Button.prototype.performClick = function (event) {
        this.onClickHandler(event);
    };
    Button.prototype.setTexture = function (textureAtlasName) {
        //var atlasTexture = PIXI.loader.resources[textureAtlasName].texture;
        var atlasTexture = _1.TextureLoader.Get(textureAtlasName);
        atlasTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        var btnHeight = atlasTexture.height / 3;
        var btnWidth = atlasTexture.width;
        this.textureUp = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight));
        this.textureHighlight = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight));
        this.textureDown = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight));
        //  calc the scale based on desired height/width
        var scaleW = (this.requestedWidth || btnWidth) / btnWidth;
        var scaleH = (this.requestedHeight || btnHeight) / btnHeight;
        this.scale.set(scaleW, scaleH);
        this.applyTexture();
    };
    return Button;
}(PIXI.Sprite));
exports.Button = Button;


/***/ }),

/***/ "./_engine/Dictionary.ts":
/*!*******************************!*\
  !*** ./_engine/Dictionary.ts ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary = /** @class */ (function () {
    function Dictionary() {
        this._values = {};
        this._keys = [];
    }
    Dictionary.prototype.get = function (key) {
        return this._values[key];
    };
    Dictionary.prototype.contains = function (key) {
        return key in this._values;
    };
    Dictionary.prototype.remove = function (key) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        delete this._values[key];
    };
    Dictionary.prototype.set = function (key, value) {
        if (!(key in this._values)) {
            this._keys.push(key);
        }
        this._values[key] = value;
    };
    Object.defineProperty(Dictionary.prototype, "keys", {
        get: function () {
            return this._keys;
        },
        enumerable: true,
        configurable: true
    });
    Dictionary.prototype.getAll = function () {
        return this._values;
    };
    Dictionary.prototype.getSet = function (key, valueOrvalueGetter) {
        if (!this.contains(key)) {
            this.set(key, typeof valueOrvalueGetter == 'function' ? valueOrvalueGetter() : valueOrvalueGetter);
        }
        return this.get(key);
    };
    Dictionary.prototype.clear = function () {
        this._keys = [];
        this._values = {};
    };
    return Dictionary;
}());
exports.Dictionary = Dictionary;


/***/ }),

/***/ "./_engine/KeyboardMapper.ts":
/*!***********************************!*\
  !*** ./_engine/KeyboardMapper.ts ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SceneManager_1 = __webpack_require__(/*! ./SceneManager */ "./_engine/SceneManager.ts");
/**
*   Simple keyboard mapper.
*/
var KeyboardMapper = /** @class */ (function () {
    /**
     *   Creates a new KeyboardMapper instance.
     */
    function KeyboardMapper() {
        var _this = this;
        this.ALT_KEY = 18;
        this.SHIFT_KEY = 16;
        this.CTRL_KEY = 17;
        this.addKeyboardActionHandler = function (action, state) {
            if (!_this.stateActions[state])
                _this.stateActions[state] = [];
            _this.stateActions[state].push(action);
        };
        this.stateActions = {};
        this.keyboard = [];
        for (var i = 0; i < 256; i++) {
            this.keyboard[i] = false;
        }
        document.addEventListener('keydown', this.keydown.bind(this), false);
        document.addEventListener('keyup', this.keyup.bind(this), false);
    }
    /*
     *   Invokes needed action handlers based on the pressed keys.
     */
    KeyboardMapper.prototype.update = function (currentState) {
        //  state specific handler
        var actions = this.stateActions[currentState];
        this.findHandlerAndInvoke(actions);
        //  global handlers
        actions = this.stateActions[SceneManager_1.State.GLOBAL];
        this.findHandlerAndInvoke(actions);
    };
    /**
     *   Searches for all keyboard handlers with matching current pressed key combinations and invokes them.
     */
    KeyboardMapper.prototype.findHandlerAndInvoke = function (actions) {
        if (actions) {
            var len = actions.length;
            for (var i = 0; i < len; i++) {
                var ka = actions[i];
                if (ka && ka.isAssigned() && ka.handler
                    && this.keyboard[ka.key]
                    && this.keyboard[this.ALT_KEY] == ka.altKey
                    && this.keyboard[this.SHIFT_KEY] == ka.shiftKey
                    && this.keyboard[this.CTRL_KEY] == ka.ctrlKey) {
                    ka.handler();
                    if (ka.releaseKeyAfterInvoke)
                        this.keyboard[ka.key] = false;
                }
            }
        }
    };
    KeyboardMapper.prototype.keydown = function (e) {
        this.keyboard[e.which] = true;
    };
    KeyboardMapper.prototype.keyup = function (e) {
        this.keyboard[e.which] = false;
    };
    KeyboardMapper.prototype.isKeyDown = function (keyCode) {
        return this.keyboard[keyCode];
    };
    return KeyboardMapper;
}());
exports.KeyboardMapper = KeyboardMapper;
var KeyboardAction = /** @class */ (function () {
    /**
    *   Creates a new KeyboardAction instance.
    */
    function KeyboardAction(key, name, handler, releaseKeyAfterInvoke, shiftKey, ctrlKey, altKey) {
        if (handler === void 0) { handler = undefined; }
        if (releaseKeyAfterInvoke === void 0) { releaseKeyAfterInvoke = true; }
        if (shiftKey === void 0) { shiftKey = false; }
        if (ctrlKey === void 0) { ctrlKey = false; }
        if (altKey === void 0) { altKey = false; }
        this.key = key;
        this.name = name;
        this.handler = handler;
        this.releaseKeyAfterInvoke = releaseKeyAfterInvoke;
        this.shiftKey = shiftKey;
        this.ctrlKey = ctrlKey;
        this.altKey = altKey;
    }
    /**
    *   Returns true if the handler is assigned.
    */
    KeyboardAction.prototype.isAssigned = function () {
        return this.handler !== undefined;
    };
    return KeyboardAction;
}());
exports.KeyboardAction = KeyboardAction;


/***/ }),

/***/ "./_engine/LinkedList.ts":
/*!*******************************!*\
  !*** ./_engine/LinkedList.ts ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        var _this = this;
        this.first = null;
        this.last = null;
        this.length = 0;
        this.AddNode = function (data) {
            var newLastNode = new LinkedListNode();
            newLastNode.data = data;
            newLastNode.previous = newLastNode.next = null;
            newLastNode.list = _this;
            if (!_this.first) {
                _this.first = newLastNode;
                _this.last = newLastNode;
            }
            else {
                newLastNode.previous = _this.last;
                _this.last.next = newLastNode;
                _this.last = newLastNode;
            }
            _this.length++;
            return newLastNode;
        };
        this.InsertNode = function (data) {
            var newFirstNode = new LinkedListNode();
            newFirstNode.data = data;
            newFirstNode.previous = newFirstNode.next = null;
            newFirstNode.list = _this;
            if (!_this.first) {
                _this.first = newFirstNode;
                _this.last = newFirstNode;
            }
            else {
                newFirstNode.next = _this.first;
                _this.first.previous = newFirstNode;
                _this.first = newFirstNode;
            }
            _this.length++;
            return newFirstNode;
        };
    }
    Object.defineProperty(LinkedList.prototype, "First", {
        get: function () {
            return this.first;
        },
        set: function (node) {
            this.first = node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkedList.prototype, "Last", {
        get: function () {
            return this.last;
        },
        set: function (node) {
            this.last = node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LinkedList.prototype, "Length", {
        get: function () {
            return this.length;
        },
        enumerable: true,
        configurable: true
    });
    LinkedList.prototype.RemoveNode = function (node) {
        if (node.previous)
            node.previous.next = node.next;
        if (node.next)
            node.next.previous = node.previous;
        this.length--;
    };
    LinkedList.prototype.RollLeft = function () {
        var last = this.first;
        var second = this.first.next;
        last.next = null;
        last.previous = this.last;
        this.last.next = last;
        this.last = last;
        this.first = second;
        this.first.previous = null;
    };
    LinkedList.prototype.forEach = function (callback) {
        var node = this.first;
        while (node) {
            callback(node);
            node = node.next;
        }
    };
    return LinkedList;
}());
exports.LinkedList = LinkedList;
var LinkedListNode = /** @class */ (function () {
    function LinkedListNode() {
        this.previous = null;
        this.next = null;
    }
    LinkedListNode.prototype.InsertBefore = function (data) {
        var node = this.list.AddNode(data);
        var previous = this.previous;
        node.next = this;
        node.previous = previous;
        this.previous = node;
        if (previous) {
            previous.next = node;
        }
        node.list = this.list;
        this.list.First = this.FindFirst();
    };
    LinkedListNode.prototype.InsertAfter = function (data) {
        var node = this.list.AddNode(data);
        var next = this.next;
        node.previous = this;
        node.next = next;
        this.next = node;
        if (next) {
            next.previous = node;
        }
        node.list = this.list;
        this.list.Last = this.FindLast();
    };
    LinkedListNode.prototype.FindFirst = function () {
        var node = this;
        while (node.previous) {
            node = node.previous;
        }
        return node;
    };
    LinkedListNode.prototype.FindLast = function () {
        var node = this;
        while (node.next) {
            node = node.next;
        }
        return node;
    };
    return LinkedListNode;
}());
exports.LinkedListNode = LinkedListNode;


/***/ }),

/***/ "./_engine/Parallax.ts":
/*!*****************************!*\
  !*** ./_engine/Parallax.ts ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var _1 = __webpack_require__(/*! . */ "./_engine/index.ts");
/**
 *   Represents a parallax background with textures that tile inside the viewport.
 */
var Parallax = /** @class */ (function (_super) {
    tslib_1.__extends(Parallax, _super);
    /**
     *   Creates a new ParalaxSprite instance.
     */
    function Parallax(size, parallaxFactor, textures, textureScale) {
        var _this = _super.call(this) || this;
        _this.textureScale = textureScale;
        _this.worldPosition = 0;
        _this.spriteBuffer = [];
        _this.spriteOrderList = [];
        /**
         * total width of all textures
         */
        _this.totalWidth = 0;
        _this.recalculatePosition = function (newPositionX) {
            var firstIdx = _this.spriteOrderList[0];
            var firstSpr = _this.spriteBuffer[firstIdx];
            var lastIdx = _this.spriteOrderList[_this.spriteOrderList.length - 1];
            var lastSpr = _this.spriteBuffer[lastIdx];
            //  update sprite positions
            var delta = (_this.worldPosition - newPositionX) * _this.parallaxFactor;
            _this.updatePositions(delta);
            if (newPositionX > _this.worldPosition) {
                //  check for removals from left side
                if (firstSpr.x + firstSpr.width < 0) {
                    _this.spriteOrderList.push(_this.spriteOrderList.shift()); //  move first element to end
                    firstSpr.x = lastSpr.x + lastSpr.width;
                }
            }
            else {
                //  check for removals from right side  
                if (lastSpr.x > _this.viewPortSize.x) {
                    _this.spriteOrderList.unshift(_this.spriteOrderList.pop()); //  move last element to start
                    lastSpr.x = firstSpr.x - lastSpr.width;
                }
            }
            _this.worldPosition = newPositionX;
        };
        _this.ViewPortSize = size || new PIXI.Point(100, 100);
        _this.parallaxFactor = parallaxFactor || 1;
        _this.textureScale = _this.textureScale || 1;
        _this.setTextures(textures);
        _this.worldPosition = 0;
        _this.SetViewPortX(1);
        return _this;
    }
    Object.defineProperty(Parallax.prototype, "WorldPosition", {
        get: function () {
            return this.worldPosition;
        },
        enumerable: true,
        configurable: true
    });
    Parallax.prototype.SetViewPortX = function (newPositionX) {
        if (this.worldPosition !== newPositionX) {
            this.recalculatePosition(newPositionX);
        }
    };
    Object.defineProperty(Parallax.prototype, "ViewPortSize", {
        get: function () {
            return this.viewPortSize;
        },
        set: function (point) {
            this.viewPortSize = point;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parallax.prototype, "ParallaxFactor", {
        get: function () {
            return this.parallaxFactor;
        },
        set: function (factor) {
            this.parallaxFactor = factor;
        },
        enumerable: true,
        configurable: true
    });
    Parallax.prototype.setTextures = function (textures) {
        var index = 0;
        var textureIndex;
        //  get the first texture to fetch the width
        var t = this.getTexture(textures, 0);
        var width = t.width * this.textureScale;
        while (this.spriteBuffer.length < 3 || //  at least 3 textures (for shifting right/left and central)
            this.spriteBuffer.length < textures.length || //  at least as many as given in input
            this.totalWidth <= this.viewPortSize.x + width //  at least to cover whole viewport size extended for one width
        ) {
            //  get the texture
            textureIndex = index % textures.length;
            t = this.getTexture(textures, textureIndex);
            t.rotate = 8; //  to adjust for worldContainer y scale -1
            // create a sprite
            var spr = new PIXI.Sprite(t);
            spr.x = this.totalWidth;
            spr.scale.set(this.textureScale, this.textureScale);
            spr.anchor.set(0, 0);
            this.spriteBuffer.push(spr);
            this.spriteOrderList.push(this.spriteBuffer.length - 1); //   will hold sprite indices from spritebuffer [0,1,2,3,4...]
            this.addChild(spr);
            //  update 
            this.totalWidth += spr.width;
            console.log(t.baseTexture.imageUrl + " -> width: " + t.width + " spr width: " + spr.width + ", total width: " + this.totalWidth);
            index++;
        }
    };
    Parallax.prototype.getTexture = function (textures, textureIndex) {
        var t;
        if (typeof textures[textureIndex] === "string") {
            //var res = PIXI.loader.resources[textures[textureIndex] as string];            
            // if(!res || !res.texture){
            //     console.error('texture not found: ' + textures[textureIndex]);
            // }
            // t = res.texture;
            t = _1.TextureLoader.Get(textures[textureIndex]);
            //t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
        else {
            t = textures[textureIndex];
        }
        return t;
    };
    Parallax.prototype.updatePositions = function (delta) {
        for (var i = 0; i < this.spriteBuffer.length; i++) {
            this.spriteBuffer[i].position.x += delta;
        }
    };
    return Parallax;
}(PIXI.Container));
exports.Parallax = Parallax;


/***/ }),

/***/ "./_engine/Scene.ts":
/*!**************************!*\
  !*** ./_engine/Scene.ts ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
/**
 *   Represents a scene.
 *   Only one scene at a time is rendered.
 */
var Scene = /** @class */ (function (_super) {
    tslib_1.__extends(Scene, _super);
    /**
     *   Creates a new scene instance.
     *   @param name the scene name.
     */
    function Scene(scm, name) {
        var _this = _super.call(this) || this;
        _this.paused = false;
        _this.hudScene = null;
        _this._clear = true;
        _this.sceneManager = scm;
        _this.backgroundColor = 0x0;
        _this.Name = name;
        return _this;
    }
    Scene.prototype.onActivate = function () { };
    Scene.prototype.onDeactivate = function () { };
    Scene.prototype.onResize = function () { };
    Scene.prototype.onUpdate = function (dt) { };
    ;
    Scene.prototype.onDestroy = function (options) { };
    Object.defineProperty(Scene.prototype, "BackGroundColor", {
        get: function () {
            return this.backgroundColor;
        },
        set: function (color) {
            this.backgroundColor = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "HudOverlay", {
        get: function () {
            return this.hudScene;
        },
        set: function (hud) {
            if (this.hudScene) {
                this.removeChild(this.hudScene);
            }
            this.hudScene = hud;
            if (this.hudScene) {
                var maxIndex = this.children.length;
                this.addChildAt(this.hudScene, maxIndex);
            }
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.addChild = function (child) {
        var dispObj = _super.prototype.addChild.call(this, child);
        if (this.hudScene) {
            var maxIndex = this.children.length - 1;
            this.setChildIndex(this.hudScene, maxIndex);
        }
        return dispObj;
    };
    Scene.prototype.addChildAt = function (child, index) {
        var dispObj = _super.prototype.addChildAt.call(this, child, index);
        if (this.hudScene) {
            var maxIndex = this.children.length - 1;
            this.setChildIndex(this.hudScene, maxIndex);
        }
        return dispObj;
    };
    Scene.prototype.pause = function () {
        this.paused = true;
    };
    Scene.prototype.resume = function () {
        this.paused = false;
    };
    Scene.prototype.isPaused = function () {
        return this.paused;
    };
    Object.defineProperty(Scene.prototype, "clear", {
        get: function () {
            return this._clear;
        },
        set: function (clearFlag) {
            this._clear = clearFlag;
        },
        enumerable: true,
        configurable: true
    });
    return Scene;
}(PIXI.Container));
exports.Scene = Scene;


/***/ }),

/***/ "./_engine/SceneManager.ts":
/*!*********************************!*\
  !*** ./_engine/SceneManager.ts ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var TWEEN = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/src/Tween.js");
var State;
(function (State) {
    State[State["GLOBAL"] = 0] = "GLOBAL";
    State[State["MENU"] = 1] = "MENU";
    State[State["IN_GAME"] = 2] = "IN_GAME";
    State[State["CUSTOM1"] = 3] = "CUSTOM1";
    State[State["CUSTOM2"] = 4] = "CUSTOM2";
    State[State["CUSTOM3"] = 5] = "CUSTOM3";
    State[State["CUSTOM4"] = 6] = "CUSTOM4";
    State[State["CUSTOM5"] = 7] = "CUSTOM5";
})(State = exports.State || (exports.State = {}));
//declare var stats: Stats;
/**
 *   Handles multiple scenes, scene activation, rendering and updates.
 */
var SceneManager = /** @class */ (function () {
    /**
     *   Creates a new SceneManager instance.
     *
     *   @param width the width of the scene
     *   @param height the height of the scene
     *   @param resizer custom resize function
     */
    function SceneManager(width, height, options, resizer) {
        var _this = this;
        this.currentScene = null;
        this.scenes = [];
        this.startTime = null;
        this.animationFrameHandle = -1;
        /**
         *   Cancels the animationFrame loop, removes all scenes and finally destroys the renderer.
         */
        this.Destroy = function () {
            cancelAnimationFrame(_this.animationFrameHandle);
            if (_this.currentScene) {
                _this.currentScene.pause();
            }
            _this.scenes.forEach(function (scene) {
                _this.RemoveScene(scene);
            });
            _this.renderer.destroy(true);
        };
        this.resizeHandler = function () {
            var avlSize = _this.sceneResizer.GetAvailableSize();
            var aspect = _this.sceneResizer.GetAspectRatio();
            var size = _this.sceneResizer.CalculateSize(avlSize, aspect);
            _this.renderer.resize(size.x, size.y);
            if (_this.currentScene) {
                _this.currentScene.scale.set(_this.sceneResizer.CalculateScale(size));
                //if (this.currentScene.onResize) {
                _this.currentScene.onResize();
                //}
            }
            if (_this.masterHudOverlay) {
                _this.masterHudOverlay.scale.set(_this.sceneResizer.CalculateScale(size));
            }
        };
        this.render = function (timestamp) {
            //stats.begin();
            _this.animationFrameHandle = requestAnimationFrame(_this.render);
            //  for tween support
            TWEEN.update(timestamp);
            //  exit if no scene or paused
            if (!_this.currentScene || _this.currentScene.isPaused()) {
                return;
            }
            if (!_this.startTime) {
                _this.startTime = timestamp;
            }
            //if (this.currentScene.onUpdate) {
            var dt = timestamp - _this.startTime;
            if (dt > 50) {
                dt = 50;
            }
            _this.currentScene.onUpdate(dt);
            //}
            _this.startTime = timestamp;
            _this.renderer.render(_this.masterContainer, undefined, _this.currentScene.clear);
            //stats.end();
        };
        this.designWidth = width;
        this.designHeight = height;
        this.sceneResizer = resizer || new DefaultResizer(this.designWidth, this.designHeight);
        this.masterContainer = new PIXI.Container();
        if (!options) {
            options = { antialias: false, roundPixels: true, backgroundColor: 0x012135, transparent: true };
        }
        this.renderer = PIXI.autoDetectRenderer(width, height, options);
        this.renderer.autoResize = true;
        //  textureGC is only used for web GL renderer
        if (this.render.textureGC) {
            this.render.textureGC.mode = PIXI.GC_MODES.AUTO;
        }
        window.removeEventListener("resize", this.resizeHandler);
        window.addEventListener("resize", this.resizeHandler, true);
        /*
        stats.showPanel(0); // 0 – use the FPS mode, 1 – use the milliseconds mode

        // Position the meter in the top-left corner
        stats.domElement.style.position = "absolute";
        stats.domElement.style.left = "";
        stats.domElement.style.right = "20px";
        stats.domElement.style.bottom = "20px";
        stats.domElement.style.top = "";

        // Append the meter to the body of your HTML5 document.
        document.body.appendChild(stats.domElement);
        */
        this.render(0);
    }
    Object.defineProperty(SceneManager.prototype, "Renderer", {
        /**
         *   Returns the renderer instance.
         */
        get: function () {
            return this.renderer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneManager.prototype, "CurrentScene", {
        /**
         *   Returns the current scene instance.
         */
        get: function () {
            return this.currentScene;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *   Adds a scene.
     */
    SceneManager.prototype.AddScene = function (scene) {
        this.scenes.push(scene);
        scene.sceneManager = this;
    };
    /**
     *   Removes all scenes.
     */
    SceneManager.prototype.RemoveAllScenes = function () {
        this.scenes.forEach(function (scene) {
            scene.sceneManager = undefined;
            scene.onDestroy(true);
        });
        this.scenes = [];
        this.currentScene = null;
    };
    /**
     *   Removes a scene.
     */
    SceneManager.prototype.RemoveScene = function (scene) {
        this.scenes = this.scenes.filter(function (item, index, arr) {
            return item !== scene;
        });
        scene.sceneManager = undefined;
    };
    /**
     * Returns true if the scene exists.
     * @param name
     */
    SceneManager.prototype.HasScene = function (name) {
        var found = this.scenes.filter(function (item) { return item.Name === name; });
        return (found && found.length > 0);
    };
    /**
     * Returns the scene by its name.
     * @param name
     */
    SceneManager.prototype.GetScene = function (name) {
        var found = this.scenes.filter(function (item) { return item.Name === name; });
        if (!found || found.length === 0) {
            throw Error("Scene: '" + name + "' not found");
        }
        if (found.length > 1) {
            throw Error("Multiple scenes: '" + name + "' found");
        }
        return found[0];
    };
    /**
     *   Activates the given scene.
     */
    SceneManager.prototype.ActivateScene = function (sceneOrName) {
        var scene;
        if (typeof (sceneOrName) === "string") {
            var found = this.scenes.filter(function (item) { return item.Name === sceneOrName; });
            if (!found || found.length === 0) {
                throw Error("Scene: '" + sceneOrName + "' not found");
            }
            if (found.length > 1) {
                throw Error("Multiple scenes: '" + sceneOrName + "' found");
            }
            scene = found[0];
        }
        else {
            scene = sceneOrName;
        }
        if (this.currentScene /*&& this.currentScene.onDeactivate*/ && this.currentScene !== scene) {
            console.log("DeactivateScene " + this.currentScene.Name);
            this.currentScene.onDeactivate();
        }
        console.log("ActivateScene " + scene.Name);
        this.startTime = null;
        this.lastScene = (this.currentScene != scene ? this.currentScene : this.lastScene);
        this.currentScene = scene;
        this.renderer.backgroundColor = scene.BackGroundColor;
        this.resizeHandler();
        //if (scene.onActivate) {
        scene.onActivate();
        //}
        this.masterContainer.removeChildren();
        this.masterContainer.addChild(this.currentScene);
        if (this.masterHudOverlay)
            this.masterContainer.addChild(this.masterHudOverlay);
        PIXI.settings.RESOLUTION = window.devicePixelRatio;
    };
    SceneManager.prototype.ActivatePreviousScene = function () {
        this.ActivateScene(this.lastScene);
    };
    Object.defineProperty(SceneManager.prototype, "MasterHudOverlay", {
        /**
         * gets the master HUD overlay object.
         */
        get: function () {
            return this.masterHudOverlay;
        },
        /**
         * Sets the master HUD overlay object.
         */
        set: function (hud) {
            this.masterHudOverlay = hud;
            this.masterContainer.removeChildren();
            this.masterContainer.addChild(this.currentScene);
            if (this.masterHudOverlay)
                this.masterContainer.addChild(this.masterHudOverlay);
            this.resizeHandler();
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  Renders the current scene in a rendertexture.
     */
    SceneManager.prototype.CaptureScene = function () {
        console.log("Capturing scene, width: " + this.renderer.width + ", height: " + this.renderer.height);
        var renderTexture = PIXI.RenderTexture.create(this.renderer.width, this.renderer.height);
        this.renderer.render(this.currentScene, renderTexture);
        return renderTexture;
    };
    return SceneManager;
}());
exports.SceneManager = SceneManager;
var DefaultResizer = /** @class */ (function () {
    function DefaultResizer(designedWidth, designedHeight) {
        this.designedWidth = designedWidth;
        this.designedHeight = designedHeight;
    }
    DefaultResizer.prototype.GetAvailableSize = function () {
        return { x: window.innerWidth, y: window.innerHeight };
    };
    DefaultResizer.prototype.GetAspectRatio = function () {
        return this.designedWidth / this.designedHeight;
    };
    DefaultResizer.prototype.CalculateSize = function (availableSize, aspect) {
        var maxWidth, maxHeight;
        maxWidth = Math.floor(aspect * availableSize.y);
        maxHeight = Math.floor(window.innerHeight);
        return { x: Math.min(maxWidth, availableSize.x), y: Math.min(maxHeight, availableSize.y) };
    };
    DefaultResizer.prototype.CalculateScale = function (newSize) {
        return newSize.x / this.designedWidth;
    };
    return DefaultResizer;
}());
exports.DefaultResizer = DefaultResizer;


/***/ }),

/***/ "./_engine/Slider.ts":
/*!***************************!*\
  !*** ./_engine/Slider.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var filter_outline_1 = __webpack_require__(/*! @pixi/filter-outline */ "./node_modules/@pixi/filter-outline/lib/filter-outline.es.js");
var _1 = __webpack_require__(/*! . */ "./_engine/index.ts");
var COLUMN_PADDING = 1;
var Slider = /** @class */ (function (_super) {
    tslib_1.__extends(Slider, _super);
    /**
     *
     * @param textureAtlas slider texture, two columns (outline, handle) and three rows (normal, highlight, pressed).
     * @param sliderFrameWidth width of the second column holding the slider handle
     * @param x
     * @param y
     * @param width
     * @param height
     */
    function Slider(textureAtlas, sliderFrameWidth, x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = _super.call(this) || this;
        _this.isPressed = false;
        _this.value = 0;
        _this.onClick = function (e) {
            _this.setSliderFromeEvent(e);
            _this.Value = _this.getCalculatedValue();
            return false;
        };
        _this.dragOffsetX = 0;
        _this.isDragging = false;
        _this.onDragStart = function (e) {
            _this.isDragging = true;
            var pos = e.data.getLocalPosition(_this.handle);
            _this.dragOffsetX = pos.x;
        };
        _this.onDragEnd = function (e) {
            _this.isDragging = false;
            _this.Value = _this.getCalculatedValue();
            e.stopped = true;
        };
        _this.onDragMove = function (e) {
            if (_this.isDragging) {
                _this.setSliderFromeEvent(e);
                return false;
            }
        };
        _this.onButtonDown = function () {
            _this.textureControl.frame = _this.frameDownControl;
            _this.textureHandle.frame = _this.frameDownHandle;
        };
        _this.onButtonUp = function (e) {
            _this.applyTextureFrames();
        };
        _this.onButtonUpOutside = function () {
            _this.applyTextureFrames();
        };
        _this.onButtonOver = function () {
            _this.control.texture.frame = _this.frameHighlightControl;
            _this.textureHandle.frame = _this.frameHighlightHandle;
        };
        _this.onButtonOut = function () {
            _this.applyTextureFrames();
        };
        _this.position.set(x || 0, y || 0);
        _this.requestedHeight = height;
        _this.requestedWidth = width;
        _this.control = new PIXI.Sprite();
        _this.control.anchor.set(0);
        _this.control.interactive = true;
        _this.control.buttonMode = false;
        _this.control.cursor = "hover";
        _this.addChild(_this.control);
        _this.control
            .on('pointerdown', _this.onButtonDown)
            .on('pointerup', _this.onButtonUp)
            .on('pointertap', _this.onClick)
            .on('pointerupoutside', _this.onButtonUpOutside)
            .on('mouseover', _this.onButtonOver)
            .on('mouseout', _this.onButtonOut);
        _this.handleWidth = sliderFrameWidth;
        _this.handle = new PIXI.Sprite();
        _this.handle.position.set(0, _this.requestedHeight / 2);
        _this.handle.anchor.set(0, 0.5);
        _this.addChild(_this.handle);
        _this.handle.interactive = true;
        _this.handle.buttonMode = false;
        _this.handle.cursor = "hover";
        _this.handle
            .on('pointerdown', _this.onDragStart)
            .on('pointerup', _this.onDragEnd)
            .on('pointerupoutside', _this.onDragEnd)
            .on('pointermove', _this.onDragMove);
        //  setup textures
        _this.SetTexture(textureAtlas, sliderFrameWidth);
        _this.IsPressed = false;
        _this.applyTextureFrames();
        _this.Value = 0.1;
        return _this;
    }
    Object.defineProperty(Slider.prototype, "Value", {
        get: function () {
            return this.value;
        },
        set: function (value) {
            if (this.value !== value) {
                this.value = value;
                this.handle.position.x = this.maxX * value;
                this.emit('valueChange', value);
                this.emit('valueChanged', value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "outlineColor", {
        get: function () {
            return this._outlineColor;
        },
        set: function (value) {
            this._outlineColor = value;
            this.control.filters = [new filter_outline_1.OutlineFilter(1, this._outlineColor, 0.5)];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "IsPressed", {
        get: function () {
            return this.isPressed;
        },
        set: function (state) {
            this.isPressed = state;
            this.applyTextureFrames();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "Text", {
        get: function () {
            return this.text;
        },
        set: function (text) {
            if (this.text) {
                this.removeChild(this.text);
            }
            this.text = text;
            if (this.text) {
                this.text.anchor.set(0.5, 0.5);
                var x = (this.width / this.scale.x) / 2;
                var y = (this.height / this.scale.y) / 2;
                this.text.position.set(x, y);
                this.addChild(this.text);
            }
        },
        enumerable: true,
        configurable: true
    });
    Slider.prototype.getCalculatedValue = function () {
        var position = this.handle.x - this.minX;
        var pct = position / this.maxX;
        return this.precise_round(pct, 2);
    };
    Slider.prototype.setSliderFromeEvent = function (e) {
        var newPosition = e.data.getLocalPosition(this.handle.parent);
        if (this.isDragging && this.dragOffsetX) {
            newPosition.x -= this.dragOffsetX;
        }
        this.handle.x = Math.min(this.maxX, Math.max(this.minX, newPosition.x));
        this.emit('valueChange', this.getCalculatedValue());
    };
    Slider.prototype.precise_round = function (num, decimals) {
        var t = Math.pow(10, decimals);
        var result = (Math.round((num * t) + (decimals > 0 ? 1 : 0) * (Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
        return parseFloat(result);
    };
    Slider.prototype.applyTextureFrames = function () {
        this.textureControl.frame = this.isPressed ? this.frameDownControl : this.frameUpControl;
        this.textureHandle.frame = this.isPressed ? this.frameDownHandle : this.frameUpHandle;
    };
    Slider.prototype.SetTexture = function (textureName, handleWidth) {
        var t = _1.TextureLoader.Get(textureName);
        //  prepare textures
        this.textureControl = new PIXI.Texture(t.baseTexture);
        this.textureControl.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.textureHandle = new PIXI.Texture(t.baseTexture);
        //  calculate rect frames for textures
        var frameHeight = this.textureControl.height / 3;
        var frameWidth = this.textureControl.width - handleWidth - COLUMN_PADDING;
        this.frameUpControl = new PIXI.Rectangle(0, 0 * frameHeight, frameWidth, frameHeight);
        this.frameHighlightControl = new PIXI.Rectangle(0, 1 * frameHeight, frameWidth, frameHeight);
        this.frameDownControl = new PIXI.Rectangle(0, 2 * frameHeight, frameWidth, frameHeight);
        var x = frameWidth + COLUMN_PADDING; //  texture elements are separated by padding pixels
        this.frameUpHandle = new PIXI.Rectangle(x, 0 * frameHeight, handleWidth, frameHeight);
        this.frameHighlightHandle = new PIXI.Rectangle(x, 1 * frameHeight, handleWidth, frameHeight);
        this.frameDownHandle = new PIXI.Rectangle(x, 2 * frameHeight, handleWidth, frameHeight);
        // set frames
        this.applyTextureFrames();
        this.control.texture = this.textureControl;
        this.control.width = this.requestedWidth;
        this.control.height = this.requestedHeight;
        // handle
        this.handle.texture = this.textureHandle;
        this.handle.height = this.requestedHeight;
        this.maxX = this.requestedWidth - this.handleWidth;
        this.minX = 0;
    };
    return Slider;
}(PIXI.Container));
exports.Slider = Slider;


/***/ }),

/***/ "./_engine/TextureLoader.ts":
/*!**********************************!*\
  !*** ./_engine/TextureLoader.ts ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var TextureLoader = /** @class */ (function () {
    function TextureLoader() {
    }
    TextureLoader.Get = function (fullName) {
        var idx = fullName.indexOf('.json@');
        var textureName = (idx > 0) ? fullName.substr(idx + 6) : fullName;
        var resourceName = (idx > 0) ? fullName.substr(0, idx + 5) : fullName;
        var res = __1.PIXI.loader.resources[resourceName];
        if (!res) {
            console.error("Resource:'" + fullName + "' not found!");
            return null;
        }
        if (res.loadType == 2) {
            return res.texture;
        }
        else if (res.loadType == 1) {
            var t = res.textures[textureName];
            t.baseTexture.scaleMode = __1.PIXI.SCALE_MODES.LINEAR;
            t.baseTexture.mipmap = false;
            return t;
        }
        else {
            console.error("Resource:'" + fullName + "' unknown load type!", res);
        }
        return null;
    };
    return TextureLoader;
}());
exports.TextureLoader = TextureLoader;


/***/ }),

/***/ "./_engine/index.ts":
/*!**************************!*\
  !*** ./_engine/index.ts ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AnimatedSprite_1 = __webpack_require__(/*! ./AnimatedSprite */ "./_engine/AnimatedSprite.ts");
exports.AnimatedSprite = AnimatedSprite_1.AnimatedSprite;
exports.AnimationSequence = AnimatedSprite_1.AnimationSequence;
var Button_1 = __webpack_require__(/*! ./Button */ "./_engine/Button.ts");
exports.Button = Button_1.Button;
exports.OutlineMode = Button_1.OutlineMode;
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./_engine/Dictionary.ts");
exports.Dictionary = Dictionary_1.Dictionary;
var KeyboardMapper_1 = __webpack_require__(/*! ./KeyboardMapper */ "./_engine/KeyboardMapper.ts");
exports.KeyboardMapper = KeyboardMapper_1.KeyboardMapper;
var LinkedList_1 = __webpack_require__(/*! ./LinkedList */ "./_engine/LinkedList.ts");
exports.LinkedList = LinkedList_1.LinkedList;
var Parallax_1 = __webpack_require__(/*! ./Parallax */ "./_engine/Parallax.ts");
exports.Parallax = Parallax_1.Parallax;
var Scene_1 = __webpack_require__(/*! ./Scene */ "./_engine/Scene.ts");
exports.Scene = Scene_1.Scene;
var SceneManager_1 = __webpack_require__(/*! ./SceneManager */ "./_engine/SceneManager.ts");
exports.SceneManager = SceneManager_1.SceneManager;
exports.DefaultResizer = SceneManager_1.DefaultResizer;
var Slider_1 = __webpack_require__(/*! ./Slider */ "./_engine/Slider.ts");
exports.Slider = Slider_1.Slider;
var TextureLoader_1 = __webpack_require__(/*! ./TextureLoader */ "./_engine/TextureLoader.ts");
exports.TextureLoader = TextureLoader_1.TextureLoader;


/***/ }),

/***/ "./app.ts":
/*!****************!*\
  !*** ./app.ts ***!
  \****************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(/*! . */ "./index.ts");
var BootScene_1 = __webpack_require__(/*! ./scenes/BootScene */ "./scenes/BootScene.ts");
/**
 *  Here we just preload fonts via google webfont.js
 *  after the fonts are loaded the bootstraper is taking over
 */
var PRELOAD_FONTS = [
    'Permanent Marker',
    'Orbitron',
    'Farsan',
];
//------------------------
// webfont loader config
//------------------------
console.log('initializing google webfont loader ...', PRELOAD_FONTS);
try {
    var cfg = {
        google: { families: PRELOAD_FONTS },
        active: function () {
            console.log('fonts preload finished!');
            var scm = _1.Global.getScm();
            var boot = new BootScene_1.BootScene(scm);
            scm.AddScene(boot);
            scm.ActivateScene(boot);
        }
    };
    window.WebFontConfig = cfg;
}
catch (e) {
    console.log(e);
}
//------------------------
// start webfont loader
//------------------------
/* jshint ignore:start */
{
    var src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    var wf = document.createElement('script');
    wf.src = src;
    wf.type = 'text/javascript';
    wf.async = true;
    var s = document.getElementsByTagName('script')[0];
    if (s.parentNode)
        s.parentNode.insertBefore(wf, s);
}
;
/* jshint ignore:end */ 


/***/ }),

/***/ "./constants.ts":
/*!**********************!*\
  !*** ./constants.ts ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SCENE_WIDTH = 1920;
exports.SCENE_HEIGHT = 1080;
exports.SCENE_HALF_WIDTH = exports.SCENE_WIDTH / 2;
exports.SCENE_HALF_HEIGHT = exports.SCENE_HEIGHT / 2;
exports.BTN_WIDTH = 120;
exports.BTN_HEIGHT = 60;
exports.MENU_LINE_HEIGHT = 60;
exports.GUI_FONT = "Orbitron";
exports.SCENE_BACKCOLOR = 0x112233;
exports.ANIMATION_FPS_NORMAL = 14;
exports.ANIMATION_FPS_SLOW = 4;
exports.BTN_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 28,
    fontFamily: exports.GUI_FONT,
    fill: 0x46fbfd,
    strokeThickness: 1,
    stroke: 0x0
};
exports.TEXT_STYLE = {
    align: "left",
    padding: 0,
    fontSize: 21,
    fontFamily: exports.GUI_FONT,
    fill: 0xE5E51B,
    strokeThickness: 3,
    stroke: 0x0f0f2f,
};
exports.MSG_COIN_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 22,
    fontFamily: exports.GUI_FONT,
    fill: 0xaaaa00,
    strokeThickness: 3,
    stroke: 0x904b15
};
exports.MSG_HP_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 24,
    fontFamily: exports.GUI_FONT,
    fill: 0x904b15,
    strokeThickness: 3,
    stroke: 0x111111
};
exports.MSG_EXP_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 24,
    fontFamily: exports.GUI_FONT,
    fill: 0x84c202,
    strokeThickness: 3,
    stroke: 0x112111
};
exports.MSG_WARN_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 27,
    fontFamily: exports.GUI_FONT,
    fill: 0xff0011,
    strokeThickness: 4,
    stroke: 0x222222
};
exports.EXP_BAR_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 13,
    fontFamily: exports.GUI_FONT,
    fill: 0x111111,
    strokeThickness: 4,
    stroke: 0xffffff
};
exports.QUEST_ITEM_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 28,
    fontFamily: "Farsan",
    fill: 0x84c2f2,
    strokeThickness: 4,
    stroke: 0x111121
};
exports.QUEST_STYLE = {
    align: "center",
    padding: 0,
    fontSize: 30,
    fontFamily: "Farsan",
    fill: 0xffffff,
    strokeThickness: 2,
    stroke: 0x8a8343,
    dropShadow: true,
    dropShadowDistance: 6,
    dropShadowBlur: 3
};


/***/ }),

/***/ "./enums.ts":
/*!******************!*\
  !*** ./enums.ts ***!
  \******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BaseStatType;
(function (BaseStatType) {
    BaseStatType[BaseStatType["MaxHP"] = 0] = "MaxHP";
    BaseStatType[BaseStatType["MaxDust"] = 1] = "MaxDust";
    BaseStatType[BaseStatType["RegenHP"] = 2] = "RegenHP";
    BaseStatType[BaseStatType["RegenDust"] = 3] = "RegenDust";
})(BaseStatType = exports.BaseStatType || (exports.BaseStatType = {}));
var StatType;
(function (StatType) {
    StatType[StatType["MaxHP"] = 0] = "MaxHP";
    StatType[StatType["HP"] = 1] = "HP";
    StatType[StatType["MaxDust"] = 2] = "MaxDust";
    StatType[StatType["Dust"] = 3] = "Dust";
    StatType[StatType["RegenHP"] = 4] = "RegenHP";
    StatType[StatType["RegenDust"] = 5] = "RegenDust";
    StatType[StatType["Coins"] = 6] = "Coins";
    StatType[StatType["Gold"] = 7] = "Gold";
    StatType[StatType["LevelExp"] = 8] = "LevelExp";
    StatType[StatType["LevelMaxExp"] = 9] = "LevelMaxExp";
    StatType[StatType["TotalExp"] = 10] = "TotalExp";
    StatType[StatType["AttributePoints"] = 11] = "AttributePoints";
    StatType[StatType["CharacterLevel"] = 12] = "CharacterLevel";
})(StatType = exports.StatType || (exports.StatType = {}));
var DamageType;
(function (DamageType) {
    DamageType[DamageType["LavaBorder"] = 1000] = "LavaBorder";
    DamageType[DamageType["Lava"] = 1001] = "Lava";
    DamageType[DamageType["Poison"] = 1002] = "Poison";
})(DamageType = exports.DamageType || (exports.DamageType = {}));
var AtrType;
(function (AtrType) {
    AtrType[AtrType["HP"] = 0] = "HP";
    AtrType[AtrType["Atk"] = 1] = "Atk";
    AtrType[AtrType["AtkCD"] = 2] = "AtkCD";
    AtrType[AtrType["Def"] = 3] = "Def";
})(AtrType = exports.AtrType || (exports.AtrType = {}));
var DirectionH;
(function (DirectionH) {
    DirectionH[DirectionH["Left"] = 0] = "Left";
    DirectionH[DirectionH["Right"] = 1] = "Right";
})(DirectionH = exports.DirectionH || (exports.DirectionH = {}));


/***/ }),

/***/ "./events.ts":
/*!*******************!*\
  !*** ./events.ts ***!
  \*******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = new PIXI.utils.EventEmitter();
exports.MOVE_TOPIC = "MOVE";
exports.BURN_TOPIC = "BURN";
exports.STATCHANGE_TOPIC = "STATCHANGE";
exports.DAMAGE_TOPIC = "DAMAGE";
//  action signaling topics
exports.GROUND_SHAKE = "SHAKE";


/***/ }),

/***/ "./global.ts":
/*!*******************!*\
  !*** ./global.ts ***!
  \*******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var PIXI = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
var particles = __webpack_require__(/*! pixi-particles */ "./node_modules/pixi-particles/dist/pixi-particles.min.js");
var _engine_1 = __webpack_require__(/*! ./_engine */ "./_engine/index.ts");
var constants_1 = __webpack_require__(/*! ./constants */ "./constants.ts");
/**
 * The global scene manager.
 */
function getScm() {
    if (!sceneManager) {
        var canvas = document.getElementById("stage");
        var renderOptions = {
            view: canvas,
            backgroundColor: 0,
            antialias: true,
            transparent: false,
            roundPixels: true,
            resolution: window.devicePixelRatio
        };
        sceneManager = new _engine_1.SceneManager(constants_1.SCENE_WIDTH, constants_1.SCENE_HEIGHT, renderOptions);
    }
    return sceneManager;
}
exports.getScm = getScm;
function deleteScm() {
    if (sceneManager) {
        sceneManager.Renderer.destroy();
    }
    sceneManager = undefined;
}
exports.deleteScm = deleteScm;
var sceneManager;
/**
 * Player position.
 */
exports.position = new PIXI.Point();
function createParticleEmitter(container, textures, config) {
    "use strict";
    var cfg = {
        alpha: {
            start: 0.8,
            end: 0.03
        },
        color: {
            start: "#dcff09",
            end: "#9f1f1f"
        },
        scale: {
            start: 0.1,
            end: 0.4,
            minimumScaleMultiplier: 1
        },
        speed: {
            start: 50,
            end: 3,
            minimumSpeedMultiplier: 1
        },
        acceleration: new PIXI.Point(),
        startRotation: {
            min: 0,
            max: 360
        },
        rotationSpeed: {
            min: 5,
            max: 20
        },
        lifetime: {
            min: 0.4,
            max: 1.0
        },
        blendMode: "add",
        frequency: 0.01,
        emitterLifetime: -1,
        maxParticles: 200,
        pos: new PIXI.Point(0, -24),
        addAtBack: false,
        spawnType: "circle",
        spawnCircle: {
            x: 0,
            y: 0,
            r: 10
        }
    };
    if (config) {
        cfg = tslib_1.__assign({}, cfg, config);
    }
    var emitter = new particles.Emitter(
    // the PIXI.Container to put the emitter in
    // if using blend modes, it's important to put this
    // on top of a bitmap, and not use the root stage Container
    container, textures, cfg);
    emitter.emit = false;
    return emitter;
}
exports.createParticleEmitter = createParticleEmitter;
exports.LevelDefinitions = {
    templates: undefined,
    levels: undefined,
    quests: undefined
};


/***/ }),

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var pixi = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
exports.PIXI = pixi;
var g = __webpack_require__(/*! ./global */ "./global.ts");
exports.Global = g;
tslib_1.__exportStar(__webpack_require__(/*! ./_engine */ "./_engine/index.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./constants */ "./constants.ts"), exports);


/***/ }),

/***/ "./mobs/AI.ts":
/*!********************!*\
  !*** ./mobs/AI.ts ***!
  \********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Global = __webpack_require__(/*! ../global */ "./global.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
/**
 * Max distance at which the target can be acquired.
 */
var LOCK_DISTANCE = 800;
/**
 * Max distance at which the target is tracked.
 */
var TRACK_DISTANCE = 1050;
/**
 * Base for all mob AI. Provides low level AI functions.
 */
var AI = /** @class */ (function () {
    function AI(mobEntity) {
        var _this = this;
        this.mobEntity = mobEntity;
        this.lastFire = 0; //performance.now() + Math.random() * 10;    //  so that the attack is not triggered at init time
        this.onUpdate = function (dt) {
            _this.calcDistance();
            //  TODO: implement visibility check
            if (_this.targetDistance < TRACK_DISTANCE) {
                _this.turnTowardsTarget();
            }
            if (_this.targetDistance < LOCK_DISTANCE) {
                _this.hasTarget = true;
                //  check attack CD            
                if (_this.canFire()) {
                    _this.mobEntity.attack();
                    _this.lastFire = performance.now();
                }
            }
            else {
                _this.hasTarget = false;
            }
        };
        this.attackCD = mobEntity.attributes[enums_1.AtrType.AtkCD];
    }
    AI.prototype.calcDistance = function () {
        var dx = Global.position.x - this.mobEntity.x;
        var dy = Global.position.y - this.mobEntity.y;
        this.targetDistance = Math.sqrt(dx * dx + dy * dy);
    };
    AI.prototype.turnTowardsTarget = function () {
        //  negative left, positive right
        var dir = Global.position.x - this.mobEntity.x;
        if (dir < 0 && this.mobEntity.direction != enums_1.DirectionH.Left) {
            this.mobEntity.direction = enums_1.DirectionH.Left;
        }
        else if (dir > 0 && this.mobEntity.direction != enums_1.DirectionH.Right) {
            this.mobEntity.direction = enums_1.DirectionH.Right;
        }
    };
    AI.prototype.canFire = function () {
        var nowMilliseconds = performance.now();
        return (this.lastFire + this.attackCD <= nowMilliseconds);
    };
    ;
    return AI;
}());
exports.AI = AI;


/***/ }),

/***/ "./mobs/BasicStaticAI.ts":
/*!*******************************!*\
  !*** ./mobs/BasicStaticAI.ts ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var AI_1 = __webpack_require__(/*! ./AI */ "./mobs/AI.ts");
/**
 * Can attack and turn towards player but invokes no other actions.
 */
var BasicStaticAI = /** @class */ (function (_super) {
    tslib_1.__extends(BasicStaticAI, _super);
    function BasicStaticAI(mobEntity) {
        return _super.call(this, mobEntity) || this;
    }
    BasicStaticAI.prototype.canFire = function () {
        var nowMilliseconds = performance.now();
        var rnd = Math.random() * 2000;
        var can = (this.lastFire + this.attackCD + rnd <= nowMilliseconds);
        if (can) {
            var rnd_1 = Math.random();
            can = can && rnd_1 > 0.3;
            this.lastFire = performance.now(); //  set to prevent firing in next update if 'can' is false
        }
        return can;
    };
    ;
    return BasicStaticAI;
}(AI_1.AI));
exports.BasicStaticAI = BasicStaticAI;


/***/ }),

/***/ "./mobs/Mob.ts":
/*!*********************!*\
  !*** ./mobs/Mob.ts ***!
  \*********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var AnimatedSprite_1 = __webpack_require__(/*! ../_engine/AnimatedSprite */ "./_engine/AnimatedSprite.ts");
var Bullet_1 = __webpack_require__(/*! ../objects/Bullet */ "./objects/Bullet.ts");
var SoundMan_1 = __webpack_require__(/*! ../world/SoundMan */ "./world/SoundMan.ts");
var BasicStaticAI_1 = __webpack_require__(/*! ./BasicStaticAI */ "./mobs/BasicStaticAI.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var FRAME_SIZE = 48;
/**
 * Represents a monster entity
 */
var Mob = /** @class */ (function (_super) {
    tslib_1.__extends(Mob, _super);
    function Mob(textureName) {
        var _this = _super.call(this) || this;
        _this.textureName = textureName;
        _this._isDead = false;
        _this.isLoading = false;
        _this.attack = function () {
            var currentSeq = _this.currentSequence;
            var currentFps = _this.fps;
            SoundMan_1.snd.atkMagic1();
            if (_this._direction == enums_1.DirectionH.Left) {
                _this.play("latk", currentFps, false);
            }
            else {
                _this.play("ratk", currentFps, false);
            }
            _this.onComplete = function (seq) {
                _this.onComplete = null;
                _this.fireBullet();
                _this.play(currentSeq.sequenceName, currentFps);
            };
        };
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("left", _this.textureName, [0, 1, 2], FRAME_SIZE, FRAME_SIZE));
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("right", _this.textureName, [3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("latk", _this.textureName, [6, 7, 8], FRAME_SIZE, FRAME_SIZE));
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("ratk", _this.textureName, [9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("lsquish", _this.textureName, [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("rsquish", _this.textureName, [18, 19, 20, 21, 22, 23], FRAME_SIZE, FRAME_SIZE));
        _this.play("left");
        _this._direction = enums_1.DirectionH.Left;
        return _this;
    }
    Object.defineProperty(Mob.prototype, "isDead", {
        get: function () {
            return this._isDead;
        },
        set: function (value) {
            if (value != this._isDead) {
                this._isDead = value;
                if (this._isDead && this.onDeathCallBack) {
                    this.onDeathCallBack();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mob.prototype, "onDeath", {
        get: function () {
            return this.onDeathCallBack;
        },
        set: function (cb) {
            this.onDeathCallBack = cb;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Kills the mob, plays squish animation and sound. Optionaly invokes the call back on animation end.
     * @param cb
     */
    Mob.prototype.squish = function (cb) {
        this.isDead = true;
        var aname = (this._direction == enums_1.DirectionH.Left ? "lsquish" : "rsquish");
        this.onComplete = cb;
        this.play(aname, 12, false);
        SoundMan_1.snd.mobSquish();
    };
    Object.defineProperty(Mob.prototype, "direction", {
        get: function () {
            return this._direction;
        },
        set: function (dir) {
            if (this._direction != dir) {
                this._direction = dir;
                if (dir === enums_1.DirectionH.Left) {
                    this.play("left");
                }
                else {
                    this.play("right");
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mob.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        set: function (values) {
            this._attributes = values;
        },
        enumerable: true,
        configurable: true
    });
    Mob.prototype.fireBullet = function () {
        if (this.atkTexture.constructor === Array) {
            //  TODO: animated sprite
        }
        else {
            //  sprite
            Bullet_1.Bullet.emitBullet(this.atkTexture, this.position, WorldP2_1.wp2.playerBody.position, this._attributes[enums_1.AtrType.Atk]);
        }
    };
    Mob.prototype.createAI = function (aiTypeName) {
        switch (aiTypeName.toLowerCase()) {
            case "basic_static":
                this._ai = new BasicStaticAI_1.BasicStaticAI(this);
                break;
            case "basic":
                //  TODO: implement AI logic variations 
                break;
        }
    };
    Mob.prototype.onUpdate = function (dt) {
        _super.prototype.onUpdate.call(this, dt);
        if (!this.isDead && !this.isLoading) {
            this._ai.onUpdate(dt);
        }
    };
    return Mob;
}(AnimatedSprite_1.AnimatedSprite));
exports.Mob = Mob;


/***/ }),

/***/ "./mobs/SpawnPoint.ts":
/*!****************************!*\
  !*** ./mobs/SpawnPoint.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LevelLoader_1 = __webpack_require__(/*! ../world/LevelLoader */ "./world/LevelLoader.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var AnimatedSprite_1 = __webpack_require__(/*! ../_engine/AnimatedSprite */ "./_engine/AnimatedSprite.ts");
var PlayerStats_1 = __webpack_require__(/*! ../objects/PlayerStats */ "./objects/PlayerStats.ts");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var SpawnPoint = /** @class */ (function () {
    function SpawnPoint(name, x, y, area, maxMobCount, respawnSeconds, entity, active) {
        if (active === void 0) { active = true; }
        this.name = name;
        this.x = x;
        this.y = y;
        this.area = area;
        this.maxMobCount = maxMobCount;
        this.respawnSeconds = respawnSeconds;
        this.entity = entity;
        this.active = active;
        this.mobCount = 0;
        this.nextSpawn = 0;
        this.nextSpawn = performance.now() / 1000;
    }
    Object.defineProperty(SpawnPoint.prototype, "IsActive", {
        get: function () { return this.active; },
        set: function (value) { this.active = value; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    SpawnPoint.prototype.onUpdate = function (dt) {
        var _this = this;
        if (this.active && this.mobCount < this.maxMobCount) {
            //  is it time to respawn?
            var now = performance.now() / 1000;
            if (this.nextSpawn <= now) {
                if (!this.worldContainer) {
                    this.worldContainer = __1.Global.getScm().GetScene("Main").worldContainer;
                }
                var mobBody = LevelLoader_1.LevelLoader.createMob(PlayerStats_1.stats.currentLevel.templates, this.entity);
                var dispObj_1 = mobBody.DisplayObject;
                var x = this.x + (Math.random() * this.area) - (this.area / 2);
                var y = this.y;
                mobBody.position = [x, y];
                WorldP2_1.wp2.addBody(mobBody);
                dispObj_1.position.set(x, y);
                dispObj_1.visible = false;
                dispObj_1.isLoading = true;
                this.worldContainer.addChild(dispObj_1);
                var loadSpr_1 = new AnimatedSprite_1.AnimatedSprite();
                loadSpr_1.addAnimations(new AnimatedSprite_1.AnimationSequence("load", "assets/img/effects/load.png", [0, 1, 2, 3], 64, 64));
                loadSpr_1.anchor.set(0.5);
                loadSpr_1.position.set(x, y + 10);
                loadSpr_1.play("load", 4, true);
                //loadSpr.scale.set(1, -1);
                this.worldContainer.addChild(loadSpr_1);
                setTimeout(function () {
                    _this.worldContainer.removeChild(loadSpr_1);
                    dispObj_1.isLoading = false;
                    dispObj_1.visible = true;
                }, 3000);
                dispObj_1.onDeath = function () {
                    console.log("mob died");
                    _this.mobCount--;
                };
                this.mobCount++;
                this.nextSpawn = (performance.now() / 1000) + this.respawnSeconds;
            }
        }
    };
    return SpawnPoint;
}());
exports.SpawnPoint = SpawnPoint;


/***/ }),

/***/ "./objects/Bullet.ts":
/*!***************************!*\
  !*** ./objects/Bullet.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var p2 = __webpack_require__(/*! p2 */ "./node_modules/p2/src/p2.js");
var CollisionGroups_1 = __webpack_require__(/*! ../world/CollisionGroups */ "./world/CollisionGroups.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var _engine_1 = __webpack_require__(/*! ../_engine */ "./_engine/index.ts");
/**
 * Base for bullets, decals etc.
 */
var Bullet = /** @class */ (function (_super) {
    tslib_1.__extends(Bullet, _super);
    /**
     * Creates a new bullet particle.
     *
     * @param texture
     * @param velocity in pixels per second
     * @param ttl time to live in seconds
     * @param damage bullet hit damage
     */
    function Bullet(texture, velocity, ttl, damage) {
        var _this = _super.call(this, texture) || this;
        _this.velocity = velocity;
        _this.damage = damage;
        _this.direction = new PIXI.Point();
        _this.interactionType = 666;
        _this.onUpdate = function () {
            // TTL expiry
            if (!_this.isDead) {
                var now = performance.now() / 1000;
                var ellapsed = now - _this.startTime;
                _this.IsDead = _this.ttl < ellapsed;
            }
        };
        _this.ttl = ttl;
        _this.IsDead = false;
        return _this;
    }
    Object.defineProperty(Bullet.prototype, "Direction", {
        get: function () {
            return this.direction;
        },
        set: function (direction) {
            //  normalize movement vector
            var len = direction.x * direction.x + direction.y * direction.y;
            len = 1 / Math.sqrt(len);
            this.direction.set(direction.x * len, direction.y * len);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "IsDead", {
        get: function () {
            return this.isDead;
        },
        set: function (value) {
            if (value != this.isDead) {
                this.isDead = value;
                //console.log("bullet is dead: " + value);
                //  if set to alive remember start time
                if (this.isDead) {
                    if (this.body) {
                        this.body.velocity = [0, 0];
                    }
                }
                else {
                    this.startTime = performance.now() / 1000;
                    if (this.body) {
                        this.body.position = [this.position.x, this.position.y];
                    }
                }
                //  fire OnDeath if needed
                if (this.isDead && this.onDeath) {
                    this.onDeath();
                }
                this.visible = !this.isDead;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bullet.prototype, "OnDeath", {
        get: function () {
            return this.onDeath;
        },
        set: function (cb) {
            this.onDeath = cb;
        },
        enumerable: true,
        configurable: true
    });
    Bullet.reset = function () {
        Bullet.bullets = [];
    };
    Bullet.bullets = [];
    Bullet.emitBullet = function (textureName, position, target, damage) {
        var bullet = Bullet.findDeadBullet();
        if (!bullet) {
            //  create new bullet
            var t = _engine_1.TextureLoader.Get(textureName);
            bullet = new Bullet(t, 200, 5, damage);
            bullet.anchor.set(0.5);
            bullet.scale.set(0.5);
            Bullet.bullets.push(bullet);
            __1.Global.worldContainer.addChild(bullet);
            //-----------------------------
            //  create body (sensor shape)
            //-----------------------------
            var shape = new p2.Circle({ radius: bullet.width / 2 });
            shape.collisionGroup = CollisionGroups_1.COL_GRP_BULLET;
            shape.collisionMask = CollisionGroups_1.COL_GRP_PLAYER | CollisionGroups_1.COL_GRP_SCENE | CollisionGroups_1.COL_GRP_GROUND;
            shape.sensor = true;
            var options = {
                mass: 0,
                position: [position.x, position.y],
                angle: 0,
                fixedRotation: false,
                angularDamping: 0,
                damping: 0
            };
            var body = new p2.Body(options);
            body.addShape(shape);
            body.setDensity(0.0);
            body.gravityScale = 0;
            body.angularVelocity = 2;
            body.collisionResponse = false;
            body.type = p2.Body.DYNAMIC;
            body.DisplayObject = bullet;
            bullet.body = body;
            WorldP2_1.wp2.addBody(body);
        }
        bullet.position = position;
        var pt = (target instanceof Float32Array) ? new PIXI.Point(target[0] - position.x, target[1] - position.y) : new PIXI.Point(target.x - position.x, target.y - position.y);
        bullet.Direction = pt;
        bullet.damage = damage;
        bullet.IsDead = false;
        bullet.body.velocity[0] = bullet.Direction.x * bullet.velocity;
        bullet.body.velocity[1] = bullet.Direction.y * bullet.velocity;
        return bullet;
    };
    Bullet.findDeadBullet = function () {
        for (var i = 0, len = Bullet.bullets.length; i < len; i++) {
            var blt = Bullet.bullets[i];
            if (blt.IsDead) {
                return blt;
            }
        }
        return null;
    };
    return Bullet;
}(PIXI.Sprite));
exports.Bullet = Bullet;


/***/ }),

/***/ "./objects/Bumper.ts":
/*!***************************!*\
  !*** ./objects/Bumper.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var TEXTURE_BUMPER = "assets/objects-atlas.json@bumper_01.png";
var TEXTURE_ROTOR = "assets/objects-atlas.json@bumper_rotor_01.png";
var ROTATION = Math.PI / 8;
var Bumper = /** @class */ (function (_super) {
    tslib_1.__extends(Bumper, _super);
    function Bumper() {
        var _this = _super.call(this, __1.TextureLoader.Get(TEXTURE_BUMPER) /*PIXI.loader.resources[TEXTURE_BUMPER].texture*/) || this;
        _this.onUpdate = function (dt) {
            var rot = _this.rotor.rotation - (ROTATION * dt / 1000);
            _this.rotor.rotation = rot % Math.PI;
        };
        _this.rotor = new PIXI.Sprite(__1.TextureLoader.Get(TEXTURE_ROTOR) /*PIXI.loader.resources[TEXTURE_ROTOR].texture*/);
        _this.rotor.anchor.set(0.5);
        _this.rotor.pivot.set(0.5);
        _this.addChild(_this.rotor);
        _this.anchor.set(0.5);
        return _this;
    }
    return Bumper;
}(PIXI.Sprite));
exports.Bumper = Bumper;


/***/ }),

/***/ "./objects/HeroCharacter.ts":
/*!**********************************!*\
  !*** ./objects/HeroCharacter.ts ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var TWEEN = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/src/Tween.js");
var global_1 = __webpack_require__(/*! ../global */ "./global.ts");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var events_1 = __webpack_require__(/*! ../events */ "./events.ts");
var __2 = __webpack_require__(/*! .. */ "./index.ts");
var MovementController_1 = __webpack_require__(/*! ./MovementController */ "./objects/MovementController.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var PlayerStats_1 = __webpack_require__(/*! ./PlayerStats */ "./objects/PlayerStats.ts");
var Mob_1 = __webpack_require__(/*! ../mobs/Mob */ "./mobs/Mob.ts");
var LevelLoader_1 = __webpack_require__(/*! ../world/LevelLoader */ "./world/LevelLoader.ts");
var SoundMan_1 = __webpack_require__(/*! ../world/SoundMan */ "./world/SoundMan.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var HERO_FRAME_SIZE = 64;
var HeroCharacter = /** @class */ (function (_super) {
    tslib_1.__extends(HeroCharacter, _super);
    function HeroCharacter(container) {
        var _this = _super.call(this) || this;
        _this.container = container;
        /**
         * Checks movementCtrl.MovementState and updates pixi dust emitter and consumption.
         * @param dt elapsed time in milliseconds
         */
        _this.onUpdate = function (dt) {
            _this.position.x = __2.Global.position.x;
            _this.position.y = __2.Global.position.y;
            if (_this.IsInteractive) {
                _this.movementCtrl.update(dt);
            }
            switch (_this.movementCtrl.MovementState) {
                case MovementController_1.MovementState.Idle:
                    _this.emitterPixies.emit = false;
                    break;
                case MovementController_1.MovementState.Left:
                case MovementController_1.MovementState.JumpLeft:
                    _this.emitterPixies.emit = _this.movementCtrl.IsRunning;
                    _this.emitterPixies.minStartRotation = -25;
                    _this.emitterPixies.maxStartRotation = 25;
                    break;
                case MovementController_1.MovementState.Right:
                case MovementController_1.MovementState.JumpRight:
                    _this.emitterPixies.emit = _this.movementCtrl.IsRunning;
                    _this.emitterPixies.minStartRotation = 155;
                    _this.emitterPixies.maxStartRotation = 205;
                    break;
                case MovementController_1.MovementState.JumpUp:
                    _this.emitterPixies.emit = _this.movementCtrl.IsRunning;
                    _this.emitterPixies.minStartRotation = 245;
                    _this.emitterPixies.maxStartRotation = 295;
                    break;
            }
            _this.emitterPixies.update(dt * 0.001);
            _this.emitterPixies.updateOwnerPos(_this.position.x, _this.position.y);
            _this.emitterBurn.update(dt * 0.001);
            //--------------------------
            //  check if running
            //--------------------------
            if (_this.movementCtrl.IsRunning && _this.movementCtrl.MovementState !== MovementController_1.MovementState.Idle) {
                PlayerStats_1.stats.increaseStat(enums_1.StatType.Dust, -dt * 0.005); //  5/sec
                var angle = 8;
                var degree = Math.PI * angle / 180;
                _this.rotation = (_this.movementCtrl.MovementState === MovementController_1.MovementState.Left) ? degree : -degree;
            }
            else {
                _this.rotation = 0;
            }
            _this.emitterBurn.emit = PlayerStats_1.stats.isBurning;
            _super.prototype.onUpdate.call(_this, dt);
        };
        _this.onPlayerMove = function (event) {
            var state = event.newState;
            var fps = event.isRunning ? __1.ANIMATION_FPS_NORMAL * 1.6 : __1.ANIMATION_FPS_NORMAL;
            switch (state) {
                case MovementController_1.MovementState.Idle:
                    if (_this.idleAnimationTimeoutHandle)
                        clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.idleAnimationTimeoutHandle = setTimeout(function () {
                        _this.play("idle", __1.ANIMATION_FPS_SLOW);
                        SoundMan_1.snd.idle();
                    }, 300);
                    break;
                case MovementController_1.MovementState.Left:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("left", fps);
                    SoundMan_1.snd.walk(event.isRunning);
                    break;
                case MovementController_1.MovementState.Right:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("right", fps);
                    SoundMan_1.snd.walk(event.isRunning);
                    break;
                case MovementController_1.MovementState.JumpLeft:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpleft", fps);
                    SoundMan_1.snd.jump();
                    break;
                case MovementController_1.MovementState.JumpRight:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpright", fps);
                    SoundMan_1.snd.jump();
                    break;
                case MovementController_1.MovementState.JumpUp:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpup", fps);
                    SoundMan_1.snd.jump();
                    break;
                case MovementController_1.MovementState.JumpDownLeft:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpdownleft", fps, false);
                    SoundMan_1.snd.jumpAttack();
                    break;
                case MovementController_1.MovementState.JumpDownRight:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpdownright", fps, false);
                    SoundMan_1.snd.jumpAttack();
                    break;
                case MovementController_1.MovementState.JumpDown:
                    clearTimeout(_this.idleAnimationTimeoutHandle);
                    _this.play("jumpdown", fps, false);
                    SoundMan_1.snd.jumpAttack();
                    break;
            }
        };
        _this.movementCtrl = new MovementController_1.MovementController(WorldP2_1.wp2);
        WorldP2_1.wp2.on("playerContact", _this.onPlayerContact, _this);
        WorldP2_1.wp2.on("bulletContact", _this.onBulletContact, _this);
        var cfg = {
            alpha: {
                start: 0.7,
                end: 0
            },
            blendMode: "normal",
            frequency: 0.01,
            startRotation: {
                min: 265,
                max: 275
            },
            color: {
                start: "#ffffff",
                end: "#ff5050"
            },
            speed: {
                start: 1,
                end: 0.5,
                minimumSpeedMultiplier: 1
            },
            scale: {
                start: 0.2,
                end: 0.6
            },
            maxParticles: 20,
            lifetime: {
                min: 0.25,
                max: 0.75
            },
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: HERO_FRAME_SIZE - 25,
                r: 25
            }
        };
        //    attached to hero sprite
        _this.emitterBurn = global_1.createParticleEmitter(_this, [PIXI.Texture.fromImage("assets/img/effects/flame.png")], cfg);
        //   attached to container since it must emit outside hero sprite
        _this.emitterPixies = global_1.createParticleEmitter(container, [PIXI.Texture.fromImage("assets/star.png")]);
        var asset = "assets/hero.png";
        _this.addAnimations(new __2.AnimationSequence("right", asset, [18, 19, 20, 21, 22, 23], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("left", asset, [12, 13, 14, 15, 16, 17], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpleft", asset, [24, 25, 26, 27, 28, 29], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpright", asset, [30, 31, 32, 33, 34, 35], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpup", asset, [1, 3, 4, 6], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("idle", asset, [1, 1, 0, 1, 2, 3, , 4, 5, 13, 12, 6, 7, 11, 18, 19, 0], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpdownleft", asset, [36, 37, 38], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpdownright", asset, [39, 40, 41], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.addAnimations(new __2.AnimationSequence("jumpdown", asset, [42, 43, 44], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
        _this.anchor.set(0.5, 0.58);
        events_1.eventEmitter.on(events_1.MOVE_TOPIC, _this.onPlayerMove);
        return _this;
    }
    Object.defineProperty(HeroCharacter.prototype, "IsInteractive", {
        /**
         * Returns if the player can interact via controls.
         */
        get: function () {
            return this.movementCtrl.isInteractive;
        },
        /**
         * Sets if the player can interact via controls.
         */
        set: function (newValue) {
            this.movementCtrl.isInteractive = newValue;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks if the player has jumped on something with a high velocity.
     * Adds smoke for ground contacts and handles mob collision for npc's.
     *
     * @param event
     */
    HeroCharacter.prototype.onPlayerContact = function (event) {
        var _this = this;
        var SND_TRESHOLD_VELOCITY = 400;
        var SMOKE_VELOCITY = 450;
        var ATTACK_VELOCITY = 550;
        var body = event.body;
        var mob = event.body.DisplayObject;
        var verticalVelocity = Math.abs(event.velocity[1]);
        if (verticalVelocity > ATTACK_VELOCITY) {
            //console.log("Vert velocity: " + verticalVelocity);
            //  check collision vs mobs
            if (mob instanceof Mob_1.Mob) {
                if (!mob.isLoading) {
                    this.handleMobInteraction(mob, body);
                }
            }
            var movementState = this.movementCtrl.MovementState;
            if (movementState === MovementController_1.MovementState.JumpDown ||
                movementState === MovementController_1.MovementState.JumpDownLeft ||
                movementState === MovementController_1.MovementState.JumpDownRight) {
                SoundMan_1.snd.jumpContact();
                events_1.eventEmitter.emit(events_1.GROUND_SHAKE, { milliSeconds: 600, magnitudeInPixels: 9 });
                return;
            }
        }
        if (verticalVelocity > SMOKE_VELOCITY) {
            console.log("Vert velocity: " + verticalVelocity);
            var smoke = new __2.AnimatedSprite();
            smoke.addAnimations(new __2.AnimationSequence("smoke", "assets/img/effects/jump_smoke.png", [0, 1, 2, 3, 4, 5], HERO_FRAME_SIZE, HERO_FRAME_SIZE));
            smoke.anchor.set(0.5);
            smoke.pivot.set(0.5);
            smoke.x = this.x;
            smoke.y = this.y - 25;
            smoke.alpha = 0.7;
            smoke.rotation = Math.random() * Math.PI;
            this.container.addChild(smoke);
            smoke.onComplete = function () { return _this.container.removeChild(smoke); };
            smoke.play("smoke", 6, false);
        }
        if (verticalVelocity > SND_TRESHOLD_VELOCITY) {
            SoundMan_1.snd.jumpContact();
            console.log("velocity: " + event.velocity);
        }
    };
    /**
     * Handles bullets hitting the player or obstacle.
     *
     * @param event
     */
    HeroCharacter.prototype.onBulletContact = function (event) {
        var _this = this;
        var bullet = event.bulletBody.DisplayObject;
        if (!bullet.IsDead) {
            if (event.playerHit) {
                SoundMan_1.snd.hitPain();
                //this.hud.addInfoMessage(this.position, `${-bullet.damage} HP`, MSG_HP_STYLE, 50);
                PlayerStats_1.stats.increaseStat(enums_1.StatType.HP, -bullet.damage);
            }
            else {
                //  TODO: recycle explode animations
                var explode = new __2.AnimatedSprite();
                explode.addAnimations(new __2.AnimationSequence("exp", "assets/img/effects/slime_atk_exp.png", [0, 1, 2, 3, 4, 5], 32, 32));
                explode.anchor.set(0.5);
                explode.pivot.set(0.5);
                explode.x = bullet.x;
                explode.y = bullet.y;
                explode.alpha = 0.7;
                explode.rotation = Math.random() * Math.PI;
                this.container.addChild(explode);
                explode.onComplete = function () { return _this.container.removeChild(explode); };
                explode.play("exp", 10, false);
                SoundMan_1.snd.bulletHitWall();
            }
            bullet.IsDead = true;
        }
    };
    /**
     * Handles interaction with mobs (mob kill).
     * @param mob
     * @param body
     */
    HeroCharacter.prototype.handleMobInteraction = function (mob, body) {
        var _this = this;
        var dispObj = body.DisplayObject;
        var it = dispObj;
        //  generate drop
        if (it.drop) {
            var isDropping = Math.random() <= it.drop.chance;
            if (isDropping) {
                var dropItemBody = LevelLoader_1.LevelLoader.createEntity(PlayerStats_1.stats.currentLevel.templates, it.drop.entity);
                this.addDropItem(mob, dropItemBody);
            }
        }
        this.removeEntity(body);
        mob.squish(function () { return _this.container.removeChild(dispObj); });
        //  add exp       
        var exp = mob.attributes[enums_1.AtrType.HP] / 2;
        PlayerStats_1.stats.increaseStat(enums_1.StatType.TotalExp, exp);
    };
    /**
     * Adds an drop item to the scene with a tween animation.
     * @param dispObj
     */
    HeroCharacter.prototype.addDropItem = function (mob, itemBody) {
        var dispObj = itemBody.DisplayObject;
        dispObj.x = mob.x;
        dispObj.y = mob.y + 40;
        this.container.addChild(dispObj);
        //  tween from mob position to random position near hero
        var upX = dispObj.position.x + 75;
        var upY = dispObj.position.y + 200;
        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 400)
            .onComplete(function () {
            itemBody.position = [dispObj.position.x, dispObj.position.y];
            WorldP2_1.wp2.addBody(itemBody);
        });
        var orgScaleX = dispObj.scale.x;
        var orgScaleY = dispObj.scale.y;
        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.3, y: orgScaleX + 0.3 }, 350)
            .easing(TWEEN.Easing.Linear.None);
        var endX = this.x;
        var endY = this.y + 8;
        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 350)
            .easing(TWEEN.Easing.Back.In)
            .onUpdate(function (pos) {
            itemBody.position = [dispObj.position.x, dispObj.position.y];
        })
            .onComplete(function () { return dispObj.scale.set(orgScaleX, orgScaleY); });
        moveUp.chain(scale, moveAway).start();
    };
    /**
     * Removes an entity from the p2 world and sets its DisplayObject to null.
     * If the removeDisplayObject is true the display object will be also removed from the worldContainer
     *
     * @param body
     * @param removeDisplayObject
     */
    HeroCharacter.prototype.removeEntity = function (body, removeDisplayObject) {
        if (removeDisplayObject === void 0) { removeDisplayObject = false; }
        WorldP2_1.wp2.removeBody(body);
        if (removeDisplayObject) {
            this.container.removeChild(body.DisplayObject);
        }
        body.DisplayObject = null;
    };
    return HeroCharacter;
}(__2.AnimatedSprite));
exports.HeroCharacter = HeroCharacter;


/***/ }),

/***/ "./objects/Lava.ts":
/*!*************************!*\
  !*** ./objects/Lava.ts ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var AnimatedSprite_1 = __webpack_require__(/*! ../_engine/AnimatedSprite */ "./_engine/AnimatedSprite.ts");
var Lava = /** @class */ (function (_super) {
    tslib_1.__extends(Lava, _super);
    function Lava(textureName) {
        var _this = _super.call(this) || this;
        _this.FRAME_SIZE_X = 64;
        _this.FRAME_SIZE_Y = 128;
        _this.addAnimations(new AnimatedSprite_1.AnimationSequence("lava", textureName, [0, 1, 2, 3], _this.FRAME_SIZE_X, _this.FRAME_SIZE_Y));
        _this.anchor.set(0.5, 0.70);
        _this.play("lava", 3);
        return _this;
    }
    return Lava;
}(AnimatedSprite_1.AnimatedSprite));
exports.Lava = Lava;


/***/ }),

/***/ "./objects/MasterHud.ts":
/*!******************************!*\
  !*** ./objects/MasterHud.ts ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var BTN_X = __1.SCENE_WIDTH - 48;
var BTN_Y = 4;
var BTN_SCALE = 1.0;
/**
 * Implements options and full screen togle buttons.
 */
var MasterHud = /** @class */ (function (_super) {
    tslib_1.__extends(MasterHud, _super);
    function MasterHud(sceneManager) {
        var _this = _super.call(this) || this;
        _this.sceneManager = sceneManager;
        //----------------------------
        //  full screen toggler
        //----------------------------
        ["", "webkit", "moz", "ms"].forEach(function (prefix) { return document.addEventListener(prefix + "fullscreenchange", function (event) {
            if (_this.isFullScreen) {
                btnFullScreen.setTexture("assets/gui-atlas.json@gui_fs_exit.png");
            }
            else {
                btnFullScreen.setTexture("assets/gui-atlas.json@gui_fs_enter.png");
            }
            btnFullScreen.scale.set(BTN_SCALE);
        }, false); });
        //--------------------------------
        //  add full screen, options and 
        //  back buttons
        //--------------------------------       
        var btnFullScreen = new __1.Button("assets/gui-atlas.json@gui_fs_enter.png", BTN_X, BTN_Y);
        btnFullScreen.onClick = function () { return _this.toggleFullScreen(); };
        btnFullScreen.scale.set(BTN_SCALE);
        _this.addChild(btnFullScreen);
        var btnOptions = new __1.Button("assets/gui-atlas.json@gui_options.png", BTN_X - 48, BTN_Y);
        btnOptions.onClick = function () { return _this.sceneManager.ActivateScene("Options"); };
        btnOptions.name = "BTN_OPTIONS";
        btnOptions.scale.set(BTN_SCALE);
        _this.addChild(btnOptions);
        return _this;
    }
    Object.defineProperty(MasterHud.prototype, "isFullScreen", {
        get: function () {
            var doc = document;
            return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
        },
        enumerable: true,
        configurable: true
    });
    MasterHud.prototype.toggleFullScreen = function () {
        var doc = document;
        var docElm = document.documentElement;
        var requestFullScreen = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen || docElm.msRequestFullscreen;
        var exitFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if (!this.isFullScreen) {
            requestFullScreen.call(docElm);
        }
        else {
            exitFullScreen.call(doc);
        }
    };
    return MasterHud;
}(PIXI.Container));
exports.MasterHud = MasterHud;


/***/ }),

/***/ "./objects/MovementController.ts":
/*!***************************************!*\
  !*** ./objects/MovementController.ts ***!
  \***************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var PlayerStats_1 = __webpack_require__(/*! ./PlayerStats */ "./objects/PlayerStats.ts");
var events_1 = __webpack_require__(/*! ../events */ "./events.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var MovementController = /** @class */ (function () {
    function MovementController(world) {
        this.VELOCITY = 150;
        this.JUMP_FORCE = 17900;
        this.JUMP_ATTACK_FORCE = -14000;
        this.JUMP_COOLDOWN = 500;
        this.JUMP_ATTACK_COOLDOWN = 2000;
        this.JUMP_ATTACK_FREEZE = 800;
        this.nextJumpAllowed = 0;
        this.nextJumpDownAllowed = 0;
        this.movementState = -1;
        this.kbd = new __1.KeyboardMapper();
        this.isRunning = false;
        this.isJumping = false;
        this.newState = MovementState.Idle;
        this._isInteractive = true;
        this.world = world;
    }
    Object.defineProperty(MovementController.prototype, "isInteractive", {
        /**
         * Returns if the player can interact via controls.
         */
        get: function () {
            return this._isInteractive;
        },
        /**
         * Sets if the player can interact via controls.
         */
        set: function (newValue) {
            this._isInteractive = newValue;
            if (!this._isInteractive) {
                this.isRunning = false;
                this.movementState = MovementState.Idle;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MovementController.prototype, "IsJumping", {
        get: function () {
            return this.isJumping;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MovementController.prototype, "CanJump", {
        get: function () {
            return !this.isJumping && this.nextJumpAllowed < performance.now();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MovementController.prototype, "IsRunning", {
        get: function () {
            return this.isRunning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MovementController.prototype, "MovementState", {
        get: function () {
            return this.movementState;
        },
        enumerable: true,
        configurable: true
    });
    MovementController.prototype.StartJump = function (direction) {
        var forceVector;
        if (direction === MovementState.JumpUp) {
            forceVector = [0, this.JUMP_FORCE];
        }
        else if (direction === MovementState.JumpLeft) {
            forceVector = [-this.JUMP_FORCE * 0.10, this.JUMP_FORCE];
        }
        else if (direction === MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE * 0.10, this.JUMP_FORCE];
        }
        this.world.playerBody.applyImpulse(forceVector);
        this.world.clearContactsForBody(this.world.playerBody);
        this.nextJumpAllowed = performance.now() + this.JUMP_COOLDOWN;
    };
    MovementController.prototype.StartJumpDown = function () {
        var _this = this;
        switch (this.movementState) {
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.newState = MovementState.JumpDownLeft;
                break;
            case MovementState.Right:
            case MovementState.JumpRight:
                this.newState = MovementState.JumpDownRight;
                break;
            default:
                this.newState = MovementState.JumpDown;
                break;
        }
        console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);
        var forceVector = [0, this.JUMP_ATTACK_FORCE];
        this.world.playerBody.setZeroForce();
        this.world.playerBody.applyImpulse(forceVector);
        this.nextJumpDownAllowed = performance.now() + this.JUMP_ATTACK_COOLDOWN;
        this.isInteractive = false;
        setTimeout(function () { return _this.isInteractive = true; }, this.JUMP_ATTACK_FREEZE);
        events_1.eventEmitter.emit(events_1.MOVE_TOPIC, {
            newState: this.newState,
            oldState: this.movementState,
            isJumping: true,
            isRunning: false // makes no difference during jumps
        });
        this.movementState = this.newState;
    };
    MovementController.prototype.update = function (dt) {
        var KEY_A = 65;
        var KEY_D = 68;
        var KEY_W = 87;
        var KEY_S = 83;
        var KEY_SHIFT = 16;
        var KEY_LEFT = 37;
        var KEY_RIGHT = 39;
        var KEY_UP = 38;
        var KEY_DOWN = 40;
        var SPACE = 32;
        this.newState = MovementState.Idle;
        var isMovingVerticaly = Math.abs(this.world.playerBody.velocity[1]) > 0.01;
        if (isMovingVerticaly) {
            var hasOnlySensorContacts = this.world.playerContacts.every(function (body) { return body.shapes[0].sensor; });
            this.isJumping = hasOnlySensorContacts;
        }
        else {
            this.isJumping = false;
        }
        //  calculate the horizontal velocity
        var v = this.calcMovementVelocity();
        //  no movement (except jump down) while jumping
        if (this.isJumping && this._isInteractive) {
            if ((this.kbd.isKeyDown(KEY_S) || this.kbd.isKeyDown(KEY_DOWN)) && PlayerStats_1.stats.HasJumpAtack && this.nextJumpDownAllowed < performance.now()) {
                this.StartJumpDown();
            }
            this.world.playerBody.velocity[0] += v;
            return;
        }
        else {
            //  calculate the horizontal velocity
            this.world.playerBody.velocity[0] = v;
        }
        var canRun = PlayerStats_1.stats.getStat(enums_1.StatType.Dust) > 1;
        var newIsRunning = this.kbd.isKeyDown(KEY_SHIFT) && canRun && this._isInteractive;
        if (this.kbd.isKeyDown(KEY_A) || this.kbd.isKeyDown(KEY_LEFT)) {
            this.newState = MovementState.Left;
        }
        else if (this.kbd.isKeyDown(KEY_D) || this.kbd.isKeyDown(KEY_RIGHT)) {
            this.newState = MovementState.Right;
        }
        //  check if jump is pressed
        if ((this.kbd.isKeyDown(KEY_W) || this.kbd.isKeyDown(KEY_UP) || this.kbd.isKeyDown(SPACE)) && this.CanJump) {
            if (this.movementState === MovementState.Left) {
                this.newState = MovementState.JumpLeft;
            }
            else if (this.movementState === MovementState.Right) {
                this.newState = MovementState.JumpRight;
            }
            else if (this.movementState === MovementState.Idle) {
                this.newState = MovementState.JumpUp;
                newIsRunning = false;
            }
        }
        //  has state changed
        if (this.newState !== this.movementState || newIsRunning !== this.IsRunning) {
            var isCurrentJumping = false;
            switch (this.newState) {
                case MovementState.JumpLeft:
                    this.StartJump(MovementState.JumpLeft);
                    isCurrentJumping = true;
                    break;
                case MovementState.JumpRight:
                    this.StartJump(MovementState.JumpRight);
                    isCurrentJumping = true;
                    break;
                case MovementState.JumpUp:
                    this.StartJump(MovementState.JumpUp);
                    isCurrentJumping = true;
                    break;
            }
            events_1.eventEmitter.emit(events_1.MOVE_TOPIC, {
                newState: this.newState,
                oldState: this.movementState,
                isJumping: isCurrentJumping,
                isRunning: newIsRunning
            });
        }
        //  update new states
        this.movementState = this.newState;
        this.isRunning = newIsRunning;
    };
    MovementController.prototype.calcMovementVelocity = function () {
        var direction = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            direction = -1;
        }
        else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            direction = 1;
        }
        if (this.IsJumping) {
            //  allow for some minimal horizontal movement (this is to prevent getting stuck in air if between two bodies with friction and no contacts)
            return direction * 0.2;
        }
        else {
            var velocity = direction * this.VELOCITY * (this.IsRunning ? 2 : 1.0);
            return velocity;
        }
    };
    return MovementController;
}());
exports.MovementController = MovementController;
var MovementState;
(function (MovementState) {
    MovementState[MovementState["Left"] = 0] = "Left";
    MovementState[MovementState["Right"] = 1] = "Right";
    MovementState[MovementState["Idle"] = 2] = "Idle";
    MovementState[MovementState["JumpLeft"] = 3] = "JumpLeft";
    MovementState[MovementState["JumpRight"] = 4] = "JumpRight";
    MovementState[MovementState["JumpUp"] = 5] = "JumpUp";
    MovementState[MovementState["JumpDownLeft"] = 6] = "JumpDownLeft";
    MovementState[MovementState["JumpDownRight"] = 7] = "JumpDownRight";
    MovementState[MovementState["JumpDown"] = 8] = "JumpDown";
})(MovementState = exports.MovementState || (exports.MovementState = {}));


/***/ }),

/***/ "./objects/Platform.ts":
/*!*****************************!*\
  !*** ./objects/Platform.ts ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var Platform = /** @class */ (function (_super) {
    tslib_1.__extends(Platform, _super);
    /**
     *
     * @param tilesX number of horizontal mid tiles. Note: this is the number of mid tiles - the actual width is tilesX + 2
     * @param tilesY number of vertical tiles
     * @param textures array of textures in specific order: top mid, top left, top right, bottom mid, bottom left, bottom right.
     */
    function Platform(tilesX, tilesY, textures) {
        if (tilesX === void 0) { tilesX = 1; }
        if (tilesY === void 0) { tilesY = 1; }
        var _this = _super.call(this) || this;
        _this.scale.set(1, -1); //  scale invert since everything is upside down due to coordinate system
        var textureNameTopLeft, textureNameTopRight, textureNameBtmMid, textureNameBtmLeft, textureNameBtmRight;
        //  this one must exist
        var textureNameTopMid = textures[0];
        if (tilesX > 1 || textures.length > 1) {
            textureNameTopLeft = textures[1];
            textureNameTopRight = textures[2];
        }
        if (tilesY > 1) {
            textureNameBtmMid = textures[3];
            textureNameBtmLeft = textures[4];
            textureNameBtmRight = textures[5];
        }
        var spr;
        var x = 0;
        //--------------------------
        //  left border
        //--------------------------
        if (textureNameTopLeft) {
            //texture = PIXI.loader.resources[textureNameTopLeft].texture;
            texture = __1.TextureLoader.Get(textureNameTopLeft);
            spr = new PIXI.Sprite(texture);
            spr.position.set(x + 1, 0);
            x += texture.width;
            _this.addChild(spr);
        }
        //--------------------------
        //  mid tiles
        //--------------------------
        //var texture = PIXI.loader.resources[textureNameTopMid].texture;
        var texture = __1.TextureLoader.Get(textureNameTopMid);
        if (tilesX > 1) {
            var w = texture.width * tilesX;
            var h = texture.height;
            spr = new PIXI.extras.TilingSprite(texture, w, h);
            spr.position.set(x, 0);
            x += w;
        }
        else {
            spr = new PIXI.Sprite(texture);
            spr.position.set(x, 0);
            x += spr.width;
        }
        _this.addChild(spr);
        //--------------------------
        //  right border
        //--------------------------
        if (textureNameTopRight) {
            //texture = PIXI.loader.resources[textureNameTopRight].texture;
            texture = __1.TextureLoader.Get(textureNameTopRight);
            spr = new PIXI.Sprite(texture);
            spr.position.set(x - 1, 0);
            x += spr.width;
            _this.addChild(spr);
        }
        //--------------------------
        //  fill downwards
        //--------------------------
        var xTiles = tilesX + 2;
        if (tilesY > 1) {
            for (var x = 0; x < xTiles; x++) {
                var name;
                if (x === 0) {
                    name = textureNameBtmLeft;
                }
                else if (x === xTiles - 1) {
                    name = textureNameBtmRight;
                }
                else {
                    name = textureNameBtmMid;
                }
                for (var y = 1; y < tilesY; y++) {
                    //texture = PIXI.loader.resources[name].texture;
                    texture = __1.TextureLoader.Get(name);
                    spr = new PIXI.Sprite(texture);
                    spr.position.set(x * spr.width, y * spr.height);
                    _this.addChild(spr);
                }
            }
        }
        return _this;
    }
    return Platform;
}(PIXI.Container));
exports.Platform = Platform;


/***/ }),

/***/ "./objects/PlayerStats.ts":
/*!********************************!*\
  !*** ./objects/PlayerStats.ts ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = __webpack_require__(/*! ../global */ "./global.ts");
var events_1 = __webpack_require__(/*! ../events */ "./events.ts");
var LevelLoader_1 = __webpack_require__(/*! ../world/LevelLoader */ "./world/LevelLoader.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var PlayerStats = /** @class */ (function () {
    function PlayerStats() {
        var _this = this;
        /**
         * Base stats are fixed values increased with level.
         */
        this.baseStats = [];
        /**
         * Attribute stats are player assigned values (point distribution).
         */
        this.attributeStats = [];
        this.stats = [];
        this.accumulator = 0.0;
        this.dpsDecreaseAmount = 0;
        //  acquired skills
        this.hasJumpAttack = false;
        this.hasMagicAttack = false;
        //  achievement levels
        this.characterLevel = 0;
        this.currentGameLevel = 0;
        this.expForNextLevel = 0;
        this.isBurningBuff = false;
        /**
         *   Stores timestamps (Unix timestamps in seconds with fractions) when the buff elapses.
         */
        this.buffs = [];
        /**
         *  Updates stats that increase/decrease over time.
         *  The update is calculated in a half second interval.
         */
        this.onUpdate = function (dt) {
            var INTERVAL = 500;
            var SECOND_2_INTERVAL = INTERVAL / 1000; //  this factor converts per second values to per interval values
            var now = performance.now() / 1000;
            //  accumulate dps
            for (var i = 1000, len = _this.buffs.length; i < len; i++) {
                if (_this.buffs[i] && _this.buffs[i] > now) {
                    var dps = 0;
                    switch (i) {
                        case enums_1.DamageType.LavaBorder:
                            dps = 5;
                            break;
                        case enums_1.DamageType.Lava:
                            dps = 15;
                            break;
                        case enums_1.DamageType.Poison:
                            dps = 10;
                            break;
                    }
                    var dmg = dt * 0.001 * dps;
                    _this.dpsDecreaseAmount += dmg;
                }
            }
            //  handle once per interval ticks
            _this.accumulator += dt;
            if (_this.accumulator > INTERVAL) {
                _this.accumulator -= INTERVAL;
                //  dust
                if (_this.stats[enums_1.StatType.Dust] < _this.stats[enums_1.StatType.MaxDust]) {
                    var v = _this.stats[enums_1.StatType.RegenDust] * SECOND_2_INTERVAL;
                    _this.increaseStat(enums_1.StatType.Dust, v);
                }
                //  hp
                if (_this.stats[enums_1.StatType.HP] < _this.stats[enums_1.StatType.MaxHP]) {
                    var v = _this.stats[enums_1.StatType.RegenHP] * SECOND_2_INTERVAL;
                    _this.increaseStat(enums_1.StatType.HP, v);
                }
                //  dps
                if (_this.dpsDecreaseAmount >= 1) {
                    var amount = Math.floor(_this.dpsDecreaseAmount);
                    var event_1 = {
                        OldValue: _this.stats[enums_1.StatType.HP],
                        Amount: -amount
                    };
                    events_1.eventEmitter.emit(events_1.DAMAGE_TOPIC, event_1);
                    _this.increaseStat(enums_1.StatType.HP, -amount);
                    _this.dpsDecreaseAmount -= amount;
                }
            }
            //--------------------------
            //  check if is burning
            //--------------------------
            var wasBurning = _this.isBurningBuff;
            _this.isBurningBuff = _this.buffs[enums_1.DamageType.LavaBorder] > now || _this.buffs[enums_1.DamageType.Lava] > now;
            if (wasBurning !== _this.isBurning) {
                events_1.eventEmitter.emit(events_1.BURN_TOPIC, { wasBurning: wasBurning, isBurning: _this.isBurningBuff });
            }
        };
        this.scevent = {
            Type: enums_1.StatType.Coins,
            OldValue: 0,
            NewValue: 0,
            Stats: []
        };
        this.id = 0;
        //  attr  stats
        this.attributeStats[enums_1.BaseStatType.RegenHP] = 0;
        this.attributeStats[enums_1.BaseStatType.RegenDust] = 0;
        this.attributeStats[enums_1.BaseStatType.MaxHP] = 0;
        this.attributeStats[enums_1.BaseStatType.MaxDust] = 0;
        // runtime stats
        this.stats[enums_1.StatType.Coins] = 0;
        this.stats[enums_1.StatType.Dust] = 600;
        this.stats[enums_1.StatType.TotalExp] = 0;
        this.stats[enums_1.StatType.AttributePoints] = 0;
        this.stats[enums_1.StatType.HP] = 120;
        var diff = 1000;
        PlayerStats.expForLevel[0] = 0;
        for (var i = 1; i < 10000; i++) {
            PlayerStats.expForLevel[i] = PlayerStats.expForLevel[i - 1] + (i * diff);
        }
        this.rebuildStats();
    }
    Object.defineProperty(PlayerStats.prototype, "LevelLoader", {
        /**
         * Rteurns the level loader.
         */
        get: function () {
            if (!this.levelLoader) {
                this.levelLoader = new LevelLoader_1.LevelLoader(global_1.LevelDefinitions);
            }
            return this.levelLoader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerStats.prototype, "isBurning", {
        /**
         * Returns true if the player is taking burn damage.
         */
        get: function () {
            return this.isBurningBuff;
        },
        enumerable: true,
        configurable: true
    });
    PlayerStats.prototype.loadLevel = function () {
        this.loadUserState();
        this.currentLevel = this.LevelLoader.buildLevel(this.currentGameLevel);
    };
    /**
     * Saves user data.
     */
    PlayerStats.prototype.saveUserState = function (isLevelCompleted) {
        if (isLevelCompleted) {
            this.currentGameLevel += 1;
        }
        var model = {
            ExternalId: this.id,
            Coins: this.stats[enums_1.StatType.Coins],
            Gold: this.stats[enums_1.StatType.Gold],
            Dust: Math.floor(this.stats[enums_1.StatType.Dust]),
            Exp: this.stats[enums_1.StatType.TotalExp],
            AtrPts: this.stats[enums_1.StatType.AttributePoints],
            HP: this.stats[enums_1.StatType.HP],
            LastLevel: this.currentGameLevel,
        };
        // AjaxHelper.Post(baseUrl + "/api/user/save", model, (data, status) => {
        //     console.log("connectUser() response", data);
        // });
        //TODO: implement
    };
    /**
     * Loads user data.
     */
    PlayerStats.prototype.loadUserState = function () {
        var model = { id: this.id };
        var data = {
            HP: this.getStat(enums_1.StatType.MaxHP),
            Exp: this.getStat(enums_1.StatType.TotalExp),
            Coins: this.getStat(enums_1.StatType.Coins),
            Dust: this.getStat(enums_1.StatType.MaxDust),
            Gold: 0,
            AtrPts: 0,
            LastLevel: this.currentGameLevel
        };
        //  todo: http get
        console.log("loadUserState() response", data);
        exports.stats.currentGameLevel = data.LastLevel;
        //  we never accept 0 hp, convert to full health instead
        if (data.HP <= 0) {
            data.HP = this.stats[enums_1.StatType.MaxHP];
        }
        this.setStat(enums_1.StatType.HP, data.HP);
        this.setStat(enums_1.StatType.Coins, data.Coins);
        this.setStat(enums_1.StatType.Gold, data.Gold);
        this.setStat(enums_1.StatType.Dust, data.Dust);
        this.setStat(enums_1.StatType.AttributePoints, data.AtrPts);
        this.setStat(enums_1.StatType.TotalExp, data.Exp);
        //  TODO: attributeStats
        this.rebuildStats();
    };
    Object.defineProperty(PlayerStats.prototype, "HasJumpAtack", {
        get: function () {
            return this.hasJumpAttack;
        },
        set: function (value) {
            this.hasJumpAttack = value;
        },
        enumerable: true,
        configurable: true
    });
    PlayerStats.prototype.setStat = function (type, value) {
        this.stats[type] = value;
        if (type === enums_1.StatType.TotalExp) {
            this.characterLevel = PlayerStats.findExpLevel(value);
            this.stats[enums_1.StatType.LevelMaxExp] = PlayerStats.expForLevel[this.characterLevel + 1] - PlayerStats.expForLevel[this.characterLevel];
            this.stats[enums_1.StatType.LevelExp] = this.stats[enums_1.StatType.TotalExp] - PlayerStats.expForLevel[this.characterLevel];
            this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];
        }
        this.updateEvent(type, value);
        events_1.eventEmitter.emit(events_1.STATCHANGE_TOPIC, this.scevent);
    };
    PlayerStats.prototype.getStat = function (type) {
        return this.stats[type];
    };
    PlayerStats.prototype.increaseStat = function (type, value, maxValue) {
        var newValue = this.stats[type] + value;
        if (maxValue && newValue > maxValue) {
            newValue = maxValue;
        }
        if (newValue < 0) {
            newValue = 0;
        }
        this.updateEvent(type, newValue);
        this.stats[type] = newValue;
        //  special logic for experience
        if (type === enums_1.StatType.TotalExp) {
            this.stats[enums_1.StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];
            //  level up check
            if (newValue >= this.expForNextLevel) {
                this.characterLevel = PlayerStats.findExpLevel(newValue);
                this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];
                this.stats[enums_1.StatType.LevelMaxExp] = this.expForNextLevel - PlayerStats.expForLevel[this.characterLevel];
                this.stats[enums_1.StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];
                //  lvl up event
                this.scevent.Type = enums_1.StatType.CharacterLevel;
                this.scevent.OldValue = this.characterLevel - 1;
                this.scevent.NewValue = this.characterLevel;
                this.scevent.Stats = this.stats;
                events_1.eventEmitter.emit(events_1.STATCHANGE_TOPIC, this.scevent);
                //  attr change event
                newValue = this.stats[enums_1.StatType.AttributePoints] + 5;
                this.scevent.Type = enums_1.StatType.AttributePoints;
                this.scevent.OldValue = this.getStat(enums_1.StatType.AttributePoints);
                this.scevent.NewValue = newValue;
                this.setStat(enums_1.StatType.AttributePoints, newValue);
                this.scevent.Stats = this.stats;
                events_1.eventEmitter.emit(events_1.STATCHANGE_TOPIC, this.scevent);
                // refill HP & dust
                this.setStat(enums_1.StatType.Dust, this.stats[enums_1.StatType.MaxDust]);
                this.setStat(enums_1.StatType.HP, this.stats[enums_1.StatType.MaxHP]);
                //  prepare regular stat change event (for exp)
                this.scevent.Type = type;
                this.scevent.OldValue = 0;
                this.scevent.NewValue = this.stats[enums_1.StatType.LevelExp];
                this.scevent.Stats = this.stats;
                //this.saveUserState(false);
            }
        }
        events_1.eventEmitter.emit(events_1.STATCHANGE_TOPIC, this.scevent);
    };
    /**
     * Finds the exp level for the given total exp value.
     * @param exp
     */
    PlayerStats.findExpLevel = function (exp) {
        for (var i = 0, len = PlayerStats.expForLevel.length; i < len; i++) {
            if (exp < PlayerStats.expForLevel[i]) {
                return i - 1;
            }
        }
    };
    PlayerStats.prototype.rebuildStats = function () {
        //  calc max & regen stats
        this.baseStats[enums_1.BaseStatType.MaxHP] = 150 + (this.characterLevel * 10);
        this.baseStats[enums_1.BaseStatType.MaxDust] = 600 + (this.characterLevel * 50);
        this.baseStats[enums_1.BaseStatType.RegenDust] = 2 + (this.characterLevel / 2);
        this.baseStats[enums_1.BaseStatType.RegenHP] = 1 + (this.characterLevel / 2);
        //  each max attribute increases base stat by 10%
        this.stats[enums_1.StatType.MaxHP] = this.baseStats[enums_1.BaseStatType.MaxHP] * (1 + this.attributeStats[enums_1.BaseStatType.MaxHP] / 10);
        this.stats[enums_1.StatType.MaxDust] = this.baseStats[enums_1.BaseStatType.MaxDust] * (1 + this.attributeStats[enums_1.BaseStatType.MaxDust] / 10);
        //  each regen attribute increases base stat by 10%
        this.stats[enums_1.StatType.RegenHP] = this.baseStats[enums_1.BaseStatType.RegenHP] * (1 + this.attributeStats[enums_1.BaseStatType.RegenHP] / 10);
        this.stats[enums_1.StatType.RegenDust] = this.baseStats[enums_1.BaseStatType.RegenDust] * (1 + this.attributeStats[enums_1.BaseStatType.RegenDust] / 10);
    };
    PlayerStats.prototype.updateEvent = function (type, newValue) {
        this.scevent.Type = type;
        this.scevent.OldValue = this.stats[type];
        this.scevent.NewValue = newValue;
        this.scevent.Stats = this.stats;
    };
    PlayerStats.expForLevel = [];
    return PlayerStats;
}());
exports.stats = new PlayerStats();


/***/ }),

/***/ "./objects/StatsHud.ts":
/*!*****************************!*\
  !*** ./objects/StatsHud.ts ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var TWEEN = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/src/Tween.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var global_1 = __webpack_require__(/*! ../global */ "./global.ts");
var PlayerStats_1 = __webpack_require__(/*! ./PlayerStats */ "./objects/PlayerStats.ts");
var events_1 = __webpack_require__(/*! ../events */ "./events.ts");
var constants_1 = __webpack_require__(/*! ../constants */ "./constants.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var StatsHud = /** @class */ (function (_super) {
    tslib_1.__extends(StatsHud, _super);
    function StatsHud() {
        var _this = _super.call(this) || this;
        _this.questMsgEndTime = 0;
        _this.handleDpsChange = function (event) {
            _this.addInfoMessage(__1.Global.position, event.Amount + " HP", constants_1.MSG_HP_STYLE, 50);
        };
        _this.handleStatChange = function (event) {
            switch (event.Type) {
                case enums_1.StatType.Coins:
                    _this.txtCoins.text = event.NewValue.toString();
                    break;
                case enums_1.StatType.Dust:
                    _this.txtDust.text = event.NewValue.toFixed(0) + " / " + event.Stats[enums_1.StatType.MaxDust].toFixed(0);
                    break;
                case enums_1.StatType.MaxDust:
                    _this.txtDust.text = Math.floor(event.Stats[enums_1.StatType.Dust]) + " / " + event.NewValue.toFixed(0);
                    break;
                case enums_1.StatType.HP:
                    _this.txtHP.text = Math.round(event.NewValue) + " / " + event.Stats[enums_1.StatType.MaxHP];
                    break;
                case enums_1.StatType.MaxHP:
                    _this.txtHP.text = Math.round(event.Stats[enums_1.StatType.HP]) + " / " + event.NewValue;
                    break;
                case enums_1.StatType.TotalExp:
                    var exp = event.NewValue - event.OldValue;
                    if (exp != 0)
                        _this.addInfoMessage({ x: 0, y: 90 }, "+" + exp + " exp", constants_1.MSG_EXP_STYLE, -50);
                    _this.renderExp(event);
                    break;
                case enums_1.StatType.CharacterLevel:
                    _this.handleLevelUp(event);
                    break;
                // case StatType.AttributePoints:
                //     this.characterMngr.visible = event.NewValue > 0;
                //     this.txtAtrPts.visible = event.NewValue > 0;
                //     //this.txtAtrPts.text = "points available";
                //     break;
            }
        };
        _this.handleLevelUp = function (event) {
            _this.txtExp.text = Math.round(event.Stats[enums_1.StatType.LevelExp]) + " / " + event.Stats[enums_1.StatType.LevelMaxExp];
            _this.expFiller.width = 1;
            _this.addLvlUpMessage("Level " + event.NewValue);
            _this.txtLevel.text = "Level " + PlayerStats_1.stats.characterLevel;
        };
        _this.setup();
        return _this;
    }
    StatsHud.prototype.setup = function () {
        //  TODO: remove or make a hud for player position
        this.txtPlayerPosition = new PIXI.Text("", constants_1.QUEST_STYLE);
        this.txtPlayerPosition.position = new PIXI.Point(constants_1.SCENE_WIDTH, constants_1.SCENE_HEIGHT);
        this.txtPlayerPosition.anchor.set(1, 1);
        this.addChild(this.txtPlayerPosition);
        //  callout for quest message
        this.panel = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@panel.png"));
        //this.panel.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.panel.position.set(4);
        this.panel.name = "TriggerMessage";
        this.panel.anchor.set(0);
        this.addChild(this.panel);
        this.txtQuestMessage = new PIXI.Text("", constants_1.QUEST_STYLE);
        this.txtQuestMessage.position.set(384, 100);
        this.txtQuestMessage.anchor.set(0.5, 0);
        this.panel.addChild(this.txtQuestMessage);
        var y = 5;
        //  HP
        {
            var pnl = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@stat_panel.png"));
            //pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            this.panel.addChild(pnl);
            this.txtHP = new PIXI.Text("0", constants_1.TEXT_STYLE);
            this.txtHP.position = new PIXI.Point(70, y + 10);
            pnl.addChild(this.txtHP);
            var spr = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@heart.png"));
            spr.position.set(8, y + 4);
            pnl.addChild(spr);
        }
        //  pixi dust
        {
            //let y = 75;
            var pnl = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@stat_panel.png"));
            //pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(261, y);
            this.panel.addChild(pnl);
            this.txtDust = new PIXI.Text("0", constants_1.TEXT_STYLE);
            this.txtDust.position = new PIXI.Point(70, y + 10);
            pnl.addChild(this.txtDust);
            this.emitter = global_1.createParticleEmitter(pnl, [__1.TextureLoader.Get("assets/star.png")]);
            this.emitter.updateOwnerPos(32, 55);
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
        }
        //  coins
        {
            //let y = 145;
            var pnl = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@stat_panel.png"));
            //pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(517, y);
            this.panel.addChild(pnl);
            this.txtCoins = new PIXI.Text("0", constants_1.TEXT_STYLE);
            this.txtCoins.position = new PIXI.Point(70, y + 10);
            pnl.addChild(this.txtCoins);
            var spr = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@coin.png"));
            spr.position.set(8, y + 4);
            pnl.addChild(spr);
        }
        //  Exp
        {
            var pnl = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@exp_panel.png"));
            //pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(0, constants_1.SCENE_HEIGHT - pnl.height);
            this.addChild(pnl);
            //  pre filler rect
            this.expPreFiller = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@exp_prefill.png"));
            this.expPreFiller.position.set(3, 3);
            pnl.addChild(this.expPreFiller);
            //  filler rect
            this.expFiller = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@exp_fill.png"));
            this.expFiller.position.set(3, 3);
            pnl.addChild(this.expFiller);
            this.fillLen = pnl.width - 6; // 3 pixels for left/right border;
            this.txtExp = new PIXI.Text("0 / 1000", constants_1.EXP_BAR_STYLE);
            this.txtExp.pivot.set(0.5);
            this.txtExp.anchor.set(0.5);
            this.txtExp.position = new PIXI.Point(pnl.width / 2, pnl.height / 2);
            pnl.addChild(this.txtExp);
            //  character level
            this.txtLevel = new PIXI.Text("Level " + PlayerStats_1.stats.characterLevel, constants_1.TEXT_STYLE);
            this.txtLevel.anchor.set(0, 0.2);
            this.txtLevel.position.set(pnl.x + pnl.width + 4, pnl.y);
            this.addChild(this.txtLevel);
        }
        events_1.eventEmitter.on(events_1.STATCHANGE_TOPIC, this.handleStatChange);
        events_1.eventEmitter.on(events_1.DAMAGE_TOPIC, this.handleDpsChange);
    };
    StatsHud.prototype.onUpdate = function (dt) {
        this.emitter.update(dt * 0.001);
        if (this.txtQuestMessage.visible && this.questMsgEndTime < performance.now()) {
            this.txtQuestMessage.visible = false;
            if (this.onCompleteCB) {
                this.onCompleteCB();
            }
        }
        this.txtPlayerPosition.text = __1.Global.position.x.toFixed(0) + ", " + __1.Global.position.y.toFixed(0);
    };
    /**
     * Starts an animation tween with informational text moving upwards from the given position.
     * @param position the start position of the message
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    StatsHud.prototype.addInfoMessage = function (position, message, style, offsetX) {
        var _this = this;
        var stl = style || constants_1.TEXT_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        offsetX = offsetX || 0;
        txtInfo.position.set(constants_1.SCENE_HALF_WIDTH + offsetX, constants_1.SCENE_HEIGHT - position.y - 70);
        txtInfo.scale.set(1, 1);
        this.addChild(txtInfo);
        var dy = (position.y > constants_1.SCENE_HALF_HEIGHT) ? 250 : -250;
        var upY = constants_1.SCENE_HEIGHT - position.y + dy;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();
        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: 1.6 }, 2200)
            .easing(TWEEN.Easing.Linear.None);
        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(function () { return _this.removeChild(txtInfo); });
        scale.chain(fade).start();
    };
    /**
     * Adds text message about acquired quest items.
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    StatsHud.prototype.addQuestItemMessage = function (message, style) {
        var _this = this;
        var stl = style || constants_1.QUEST_ITEM_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.anchor.set(0.5, 0.5);
        txtInfo.position.set(constants_1.SCENE_HALF_WIDTH, 150);
        this.addChild(txtInfo);
        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.8, y: 1.8 }, 2200)
            .easing(TWEEN.Easing.Linear.None);
        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(function () { return _this.removeChild(txtInfo); });
        scale.chain(fade).start();
    };
    /**
     * Displays the quest message in the quest rectangle.
     * @param msg
     * @param ttlMilis
     */
    StatsHud.prototype.setQuestMessage = function (msg, ttlMilis, onCompleteCB) {
        if (ttlMilis === void 0) { ttlMilis = 8000; }
        if (onCompleteCB === void 0) { onCompleteCB = null; }
        this.txtQuestMessage.text = msg;
        this.panel.visible = true;
        this.txtQuestMessage.visible = true;
        this.questMsgEndTime = performance.now() + ttlMilis;
        this.onCompleteCB = onCompleteCB;
    };
    /**
     * Starts an animation tween with level up message.
     * @param message the message to be added
     */
    StatsHud.prototype.addLvlUpMessage = function (message) {
        var _this = this;
        var stl = {
            align: "center",
            padding: 0,
            fontSize: "64px",
            fontFamily: constants_1.GUI_FONT,
            fill: 0x335533,
            strokeThickness: 6,
            stroke: 0xccccff
        };
        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.scale.set(1);
        txtInfo.anchor.set(0.5);
        txtInfo.position.set(constants_1.SCENE_HALF_WIDTH, constants_1.SCENE_HEIGHT - __1.Global.position.y - 70);
        this.addChild(txtInfo);
        var dy = (__1.Global.position.y > constants_1.SCENE_HALF_HEIGHT) ? 450 : -450;
        var upY = constants_1.SCENE_HEIGHT - __1.Global.position.y + dy;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();
        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: 1.6 }, 1500)
            .easing(TWEEN.Easing.Linear.None);
        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0.4 }, 6000)
            .onComplete(function () { return _this.removeChild(txtInfo); });
        scale.chain(fade).start();
    };
    StatsHud.prototype.renderExp = function (event) {
        this.txtExp.text = Math.round(event.Stats[enums_1.StatType.LevelExp]) + " / " + event.Stats[enums_1.StatType.LevelMaxExp];
        this.txtLevel.text = "Level " + PlayerStats_1.stats.characterLevel;
        var pct = Math.min(event.Stats[enums_1.StatType.LevelExp] / event.Stats[enums_1.StatType.LevelMaxExp], 1.0);
        //  special case during level up
        if (pct === 0) {
            this.expFiller.width = 1;
            this.expPreFiller.position.x = 1 + this.expFiller.x;
            return;
        }
        this.expPreFiller.position.x = this.expFiller.width + this.expFiller.x;
        var targetWidth = (this.fillLen * pct) | 0;
        var diff = targetWidth - this.expFiller.width;
        //  tween pre-fill width
        this.expPreFiller.width = 1;
        var preFillTween = new TWEEN.Tween(this.expPreFiller)
            .to({ width: diff }, 1500)
            .easing(TWEEN.Easing.Linear.None);
        var fillTween = new TWEEN.Tween(this.expFiller)
            .to({ width: targetWidth }, 2000)
            .easing(TWEEN.Easing.Bounce.Out);
        preFillTween.chain(fillTween).start();
    };
    return StatsHud;
}(PIXI.Container));
exports.StatsHud = StatsHud;


/***/ }),

/***/ "./questSystem/QuestManager.ts":
/*!*************************************!*\
  !*** ./questSystem/QuestManager.ts ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Global = __webpack_require__(/*! ../global */ "./global.ts");
var QuestState_1 = __webpack_require__(/*! ./QuestState */ "./questSystem/QuestState.ts");
var PlayerStats_1 = __webpack_require__(/*! ../objects/PlayerStats */ "./objects/PlayerStats.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var SoundMan_1 = __webpack_require__(/*! ../world/SoundMan */ "./world/SoundMan.ts");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
/**
 * Contains quest related logic, checks and helpers.
 */
var QuestManager = /** @class */ (function () {
    function QuestManager(gameScene) {
        this.gameScene = gameScene;
        this.questState = [];
        this.hud = this.gameScene.HudOverlay;
    }
    /**
     * Resets state of all quests.
     */
    QuestManager.prototype.reset = function () {
        var _this = this;
        this.questState.forEach(function (qs, index) {
            if (qs != QuestState_1.QuestState.None) {
                var quest = _this.findQuest(index);
                quest.itemsCollected = 0;
            }
        });
        this.questState = [];
    };
    /**
     *
     * @param itemId
     */
    QuestManager.prototype.acquireItem = function (itemId) {
        //  find if there is an unfinished quest depending on that item
        var quest = this.findQuestWithItem(itemId);
        if (quest) {
            quest.itemsCollected++;
            this.hud.addQuestItemMessage("collected " + quest.itemsCollected + " / " + quest.itemsNeeded);
            if (quest.itemsCollected >= quest.itemsNeeded) {
                this.setQuestState(quest.id, QuestState_1.QuestState.Completed);
                if (quest.completedMsg) {
                    this.hud.setQuestMessage(quest.completedMsg);
                }
            }
        }
    };
    /**
     * Checks if a trigger can be activated.
     * @param trigger
     */
    QuestManager.prototype.canActivateTrigger = function (trigger) {
        if (!trigger || !trigger.questId) {
            return false;
        }
        //  check if trigger depends on quest 
        if (Array.isArray(trigger.dependsOn)) {
            for (var i = 0; i < trigger.dependsOn.length; i++) {
                var dependency = trigger.dependsOn[i];
                var state = this.questState[dependency];
                if (!state || state != QuestState_1.QuestState.Rewarded)
                    return false;
            }
        }
        var TEN_SECONDS = 10000;
        var nextAllowedTime = (trigger.lastActive || -TEN_SECONDS) + TEN_SECONDS;
        return nextAllowedTime < performance.now();
    };
    /**
     * Handles level events triggers.
     * @param body
     */
    QuestManager.prototype.handleTriggerEvent = function (body) {
        var _this = this;
        var scm = Global.getScm();
        var trigger = body.Trigger;
        //  note: trigger can have a predefined state (so we skip previous states)
        var state = Math.max(this.getQuestState(trigger.questId), trigger.state || 0);
        // react only if trigger has quest id and last active is older than 10 seconds 
        if (this.canActivateTrigger(trigger)) {
            trigger.lastActive = performance.now();
            var quest_1 = this.findQuest(trigger.questId);
            switch (trigger.questId) {
                case 1: //   intro
                    if (state === QuestState_1.QuestState.None) {
                        this.setQuestState(trigger.questId, QuestState_1.QuestState.Completed);
                        this.gameScene.IsHeroInteractive = false;
                        this.hud.setQuestMessage(quest_1.welcomeMsg, 2000, function () {
                            _this.hud.setQuestMessage(quest_1.completedMsg, 2000, function () {
                                _this.gameScene.IsHeroInteractive = true;
                                _this.setQuestState(trigger.questId, QuestState_1.QuestState.Finished);
                                _this.giveRewards(quest_1);
                                _this.setQuestState(trigger.questId + 1, QuestState_1.QuestState.InProgress);
                                quest_1 = _this.findQuest(trigger.questId + 1);
                                _this.hud.setQuestMessage(quest_1.welcomeMsg, 4000);
                            });
                        });
                    }
                    break;
                case 2: //  intro - jump on box task
                    if (this.getQuestState(1) > QuestState_1.QuestState.Finished) {
                        if (state === QuestState_1.QuestState.InProgress) {
                            this.setQuestState(trigger.questId, QuestState_1.QuestState.Completed);
                            //this.gameScene.IsHeroInteractive = false;
                            this.hud.setQuestMessage(quest_1.completedMsg, 4000, function () {
                                _this.gameScene.IsHeroInteractive = true;
                                _this.setQuestState(trigger.questId, QuestState_1.QuestState.Finished);
                                _this.giveRewards(quest_1);
                                //  start quest 3
                                quest_1 = _this.findQuest(trigger.questId + 1);
                                _this.setQuestState(trigger.questId + 1, QuestState_1.QuestState.InProgress);
                                _this.hud.setQuestMessage(quest_1.welcomeMsg);
                            });
                        }
                        else if (state >= QuestState_1.QuestState.Finished) {
                            quest_1 = this.findQuest(trigger.questId + 1);
                            this.hud.setQuestMessage(quest_1.welcomeMsg, 4000);
                        }
                    }
                    break;
                case 3: //  intro - exit sign                                           
                    if (state === QuestState_1.QuestState.InProgress) {
                        this.setQuestState(trigger.questId, QuestState_1.QuestState.Finished);
                        this.giveRewards(quest_1);
                        this.gameScene.IsHeroInteractive = false;
                        this.hud.setQuestMessage(quest_1.completedMsg, 4000, function () {
                            Global.getScm().ActivateScene("Loader");
                        });
                        PlayerStats_1.stats.saveUserState(true);
                        SoundMan_1.snd.win();
                    }
                    break;
                case 201: //  Kendo knowledge
                    this.genericQuestHandler(quest_1, state, body, [
                        function () {
                            var item = Global.worldContainer.getChildByName("quest_item_201");
                            item.visible = true;
                            var lock = _this.findBodyByName("lock");
                            _this.gameScene.removeEntity(lock, true);
                        },
                        function () { },
                        function () {
                            _this.setQuestState(trigger.questId, QuestState_1.QuestState.Finished);
                            _this.giveRewards(quest_1);
                            _this.gameScene.IsHeroInteractive = false;
                            PlayerStats_1.stats.saveUserState(true);
                            SoundMan_1.snd.win();
                            _this.hud.visible = false;
                            var cs = scm.GetScene("CutScene");
                            cs.SetText(quest_1.finishedMsg, __1.QUEST_STYLE);
                            var rt = scm.CaptureScene();
                            cs.SetBackGround(rt, _this.gameScene.scale);
                            scm.ActivateScene(cs);
                        }
                    ]);
                    break;
                // case 202:   //  seek the hanshi Kendo master
                //     this.genericQuestHandler(quest, state, body);
                //     break;
                case 203: //  hanshi Kendo master dojo: collect 10 ki
                    this.genericQuestHandler(quest_1, state, body, [
                        function () { PlayerStats_1.stats.HasJumpAtack = true; },
                        function () { },
                        function () { },
                        function () { }
                    ]);
                    break;
                // case 204:   //  hanshi Kendo master dojo: collect 25 ki
                //     this.genericQuestHandler(quest, state, body);
                //     break;
                default:
                    this.genericQuestHandler(quest_1, state, body);
                    break;
            }
        }
    };
    /**
     *
     * @param quest
     * @param state
     * @param body the physics sensor or trigger that causes this quest
     * @param actions array of actions (one optional action for each state)
     */
    QuestManager.prototype.genericQuestHandler = function (quest, state, body, actions) {
        var trigger = body.Trigger;
        switch (state) {
            case QuestState_1.QuestState.None:
                this.setQuestState(quest.id, QuestState_1.QuestState.InProgress);
                this.hud.setQuestMessage(quest.welcomeMsg);
                break;
            case QuestState_1.QuestState.InProgress:
                this.hud.setQuestMessage(quest.objectiveMsg);
                break;
            case QuestState_1.QuestState.Completed:
                if (quest.itemId && quest.itemsCollected >= quest.itemsNeeded) { //  if the acquireItem has set quest to completed move to next stated
                    this.setQuestState(quest.id, QuestState_1.QuestState.Finished);
                    trigger.lastActive = 0;
                }
                else {
                    this.hud.setQuestMessage(quest.completedMsg);
                }
                break;
            case QuestState_1.QuestState.Finished:
                this.hud.setQuestMessage(quest.finishedMsg);
                this.giveRewards(quest);
                this.gameScene.removeEntity(body, true); // remove the sensor from physics and the displayobject from scene
                break;
        }
        if (actions && actions[state]) {
            actions[state]();
        }
    };
    QuestManager.prototype.giveRewards = function (quest) {
        SoundMan_1.snd.questItem();
        if (quest.rewardExp) {
            PlayerStats_1.stats.increaseStat(enums_1.StatType.TotalExp, quest.rewardExp);
            // let pt = new PIXI.Point(Global.position.x, Global.position.y + 50);
            // this.hud.addInfoMessage(pt, `+${quest.rewardExp} exp`, MSG_EXP_STYLE);
        }
        if (quest.rewardCoins) {
            PlayerStats_1.stats.increaseStat(enums_1.StatType.Coins, quest.rewardCoins);
            // let pt = new PIXI.Point(Global.position.x + 50, Global.position.y + 100);
            // this.hud.addInfoMessage(pt, `+${quest.rewardCoins} coins`);
        }
        this.setQuestState(quest.id, QuestState_1.QuestState.Rewarded);
    };
    QuestManager.prototype.findQuest = function (questId) {
        var quests = Global.LevelDefinitions.quests.filter(function (q) {
            return q.id === questId;
        });
        var quest = quests[0];
        return quest;
    };
    QuestManager.prototype.findQuestWithItem = function (itemId) {
        var _this = this;
        var quests = Global.LevelDefinitions.quests.filter(function (q) {
            if (q.itemId === itemId) {
                var state = _this.getQuestState(q.id);
                return state < QuestState_1.QuestState.Completed && state > QuestState_1.QuestState.None;
            }
            return false;
        });
        if (quests.length > 0) {
            return quests[0];
        }
        else {
            return null;
        }
    };
    /**
    * Sets the quest state.
    */
    QuestManager.prototype.setQuestState = function (questId, state) {
        this.questState[questId] = state;
    };
    /**
     * Gets the quest state.
     */
    QuestManager.prototype.getQuestState = function (questId) {
        return this.questState[questId] || QuestState_1.QuestState.None;
    };
    /**
     * Finds a body with the given display objects name.
     * @param name
     */
    QuestManager.prototype.findBodyByName = function (name) {
        var foundBody = undefined;
        WorldP2_1.wp2.bodies.forEach(function (body) {
            var dispObj = body.DisplayObject;
            if (dispObj && dispObj.name === name) {
                foundBody = body;
            }
        });
        return foundBody;
    };
    return QuestManager;
}());
exports.QuestManager = QuestManager;


/***/ }),

/***/ "./questSystem/QuestState.ts":
/*!***********************************!*\
  !*** ./questSystem/QuestState.ts ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var QuestState;
(function (QuestState) {
    QuestState[QuestState["None"] = 0] = "None";
    /**
     *  Quest has been started.
     */
    QuestState[QuestState["InProgress"] = 1] = "InProgress";
    /**
     *  Quest items/conditions have been completed.
     */
    QuestState[QuestState["Completed"] = 2] = "Completed";
    /**
     *  Quest has been finished.
     */
    QuestState[QuestState["Finished"] = 3] = "Finished";
    /**
     *  Quest has been finished and reward awarded.
     */
    QuestState[QuestState["Rewarded"] = 4] = "Rewarded";
})(QuestState = exports.QuestState || (exports.QuestState = {}));


/***/ }),

/***/ "./scenes/BootScene.ts":
/*!*****************************!*\
  !*** ./scenes/BootScene.ts ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var LoaderScene_1 = __webpack_require__(/*! ./LoaderScene */ "./scenes/LoaderScene.ts");
var __2 = __webpack_require__(/*! .. */ "./index.ts");
var PRELOAD_BOOT_ASSETS = [
    //  cursors
    'assets/gui/cur_default.png',
    'assets/gui/cur_hover.png',
    'assets/gui/cur_target.png',
    'assets/levels.json',
    'assets/quests.json'
];
/**
 * Preloads common assets, after preloading parses user state and starts preloading level assets.
 */
var BootScene = /** @class */ (function (_super) {
    tslib_1.__extends(BootScene, _super);
    function BootScene(scm) {
        var _this = _super.call(this, scm, "Boot") || this;
        _this.onUpdate = function (dt) {
            if (_this.spinner) {
                _this.spinner.rotation += 0.05;
            }
        };
        _this.onActivate = function () {
            _this.loadingMessage = new __1.PIXI.Text("booting ...", {
                fontSize: "36px",
                fontFamily: "Permanent Marker",
                fill: 0x0ff00,
                dropShadow: true,
                stroke: 0x44ff44,
                strokeThickness: 1
            });
            _this.loadingMessage.anchor.set(0.5, 0.5);
            _this.loadingMessage.position.set(__2.SCENE_HALF_WIDTH, __2.SCENE_HALF_HEIGHT - 80);
            _this.addChild(_this.loadingMessage);
            //------------------------------------------------------
            //  get loading image and define callback on image load
            //------------------------------------------------------
            __1.PIXI.loader.reset()
                .add("assets/loading.png")
                .load(_this.startPreloading);
        };
        /**
         *  Downloads common assets, JSON files etc.
         */
        _this.startPreloading = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var loadingTexture;
            return tslib_1.__generator(this, function (_a) {
                loadingTexture = __1.PIXI.Texture.fromImage("assets/loading.png");
                this.spinner = new __1.PIXI.Sprite(loadingTexture);
                this.spinner.position.set(__2.SCENE_HALF_WIDTH, __2.SCENE_HALF_HEIGHT);
                this.spinner.anchor.set(0.5, 0.5);
                this.spinner.scale.set(0.5);
                this.addChild(this.spinner);
                console.log('initializing common assets preloading ...', PRELOAD_BOOT_ASSETS);
                __1.PIXI.loader
                    .add(PRELOAD_BOOT_ASSETS)
                    .load(this.onPreloadFinished);
                return [2 /*return*/];
            });
        }); };
        _this.onPreloadFinished = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var defaultIcon, hoverIcon, targetIcon, questsObj, ls;
            return tslib_1.__generator(this, function (_a) {
                defaultIcon = "url('assets/gui/cur_default.png'),auto";
                hoverIcon = "url('assets/gui/cur_hover.png'),auto";
                targetIcon = "url('assets/gui/cur_target.png') 24 24, auto";
                this.sceneManager.Renderer.plugins.interaction.cursorStyles.default = defaultIcon;
                this.sceneManager.Renderer.plugins.interaction.cursorStyles.hover = hoverIcon;
                this.sceneManager.Renderer.plugins.interaction.cursorStyles.target = targetIcon;
                document.body.style.cursor = defaultIcon;
                // save levels and quests
                __1.Global.LevelDefinitions = __1.PIXI.loader.resources["assets/levels.json"].data;
                questsObj = __1.PIXI.loader.resources["assets/quests.json"].data;
                __1.Global.LevelDefinitions.quests = questsObj.quests;
                __1.Global.LevelDefinitions.quests.forEach(function (q) {
                    q.itemId = q.itemId || 0;
                    q.itemsNeeded = q.itemsNeeded || 0;
                    q.itemsCollected = 0;
                    q.rewardCoins = q.rewardCoins || 0;
                    q.rewardExp = q.rewardExp || 0;
                });
                ls = new LoaderScene_1.LoaderScene(this.sceneManager);
                this.sceneManager.AddScene(ls);
                this.sceneManager.ActivateScene(ls);
                return [2 /*return*/];
            });
        }); };
        _this.BackGroundColor = 0;
        return _this;
    }
    return BootScene;
}(__1.Scene));
exports.BootScene = BootScene;


/***/ }),

/***/ "./scenes/CutScene.ts":
/*!****************************!*\
  !*** ./scenes/CutScene.ts ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var Scene_1 = __webpack_require__(/*! ../_engine/Scene */ "./_engine/Scene.ts");
var Button_1 = __webpack_require__(/*! ../_engine/Button */ "./_engine/Button.ts");
var SoundMan_1 = __webpack_require__(/*! ../world/SoundMan */ "./world/SoundMan.ts");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var CutScene = /** @class */ (function (_super) {
    tslib_1.__extends(CutScene, _super);
    function CutScene(scm) {
        var _this = _super.call(this, scm, "CutScene") || this;
        _this.deathScene = false;
        _this.onActivate = function () {
            _this.btnContinue.visible = !_this.deathScene;
            _this.callout.visible = !_this.deathScene;
            _this.corpse.visible = _this.deathScene;
            _this.corpse.scale.set(0.1);
            _this.btnContinue.text.text = _this.deathScene ? "Retry" : "Continue";
            if (_this.deathScene) {
                var deathTrackId = SoundMan_1.snd.getTrack("Carrousel");
                SoundMan_1.snd.playTrack(deathTrackId);
            }
        };
        _this.deathMessages = [
            "Life sucks and you just died!",
            "You decided to check the\nafterlife. Guess what?\n\nYou are dead!",
            "Owned!\nMore luck next time.",
            "You have died!\nRest in peace.",
            "Your quest has failed.\nMay you find more peace\nin that world than\nyou found in this one.",
            "Here's a picture of\nyour corpse.\n\nNot pretty!",
            "Yep, you're dead.\nMaybe you should consider\nplaying a Barbie game!",
            "Died..."
        ];
        _this.BackGroundColor = 0x1099bb;
        _this.corpse = new PIXI.Sprite(PIXI.loader.resources["assets/hero-dead.png"].texture);
        _this.corpse.anchor.set(0.5);
        _this.corpse.pivot.set(0.5);
        _this.corpse.position.set(__1.SCENE_HALF_WIDTH, __1.SCENE_HALF_HEIGHT);
        _this.addChild(_this.corpse);
        _this.corpseBlurFilter = new PIXI.filters.BlurFilter();
        _this.corpse.filters = [_this.corpseBlurFilter];
        _this.callout = new PIXI.Sprite(__1.TextureLoader.Get("assets/gui-atlas.json@rect.png"));
        _this.callout.anchor.set(0.5);
        _this.callout.position.set(__1.SCENE_HALF_WIDTH, __1.SCENE_HEIGHT / 5);
        _this.addChild(_this.callout);
        _this.textMessage = new PIXI.Text("");
        _this.textMessage.anchor.set(0.5);
        _this.textMessage.position.set(0, 0);
        _this.callout.addChild(_this.textMessage);
        //--------------------------------
        //  btn for next level
        //--------------------------------
        _this.btnContinue = new Button_1.Button("assets/gui-atlas.json@gui_button1.png", (__1.SCENE_WIDTH - __1.BTN_WIDTH) / 2, _this.callout.height + __1.BTN_HEIGHT, __1.BTN_WIDTH, __1.BTN_HEIGHT);
        _this.btnContinue.text = new PIXI.Text("Continue", __1.BTN_STYLE);
        _this.btnContinue.onClick = function () {
            _this.sceneManager.ActivateScene("Loader");
        };
        _this.addChild(_this.btnContinue);
        return _this;
    }
    CutScene.prototype.onUpdate = function (dt) {
        if (this.deathScene) {
            if (this.corpse.scale.x < 2.5) {
                this.corpse.rotation += 0.03;
                var scale = this.corpse.scale.x + 0.01;
                this.corpse.scale.set(scale);
            }
            else {
                //  death msg & retry btn
                this.deathScene = false;
                this.textMessage.text = this.deathMessages[0 | (Math.random() * this.deathMessages.length)];
                this.callout.visible = true;
                this.btnContinue.visible = true;
            }
        }
        else {
            this.corpse.rotation += 0.005;
        }
        var blr = Math.max(5, this.corpseBlurFilter.blur + 0.00004);
        this.corpseBlurFilter.blur = blr;
    };
    Object.defineProperty(CutScene.prototype, "DeathScene", {
        /**
         * If true the player death scene is played.
         */
        get: function () {
            return this.deathScene;
        },
        set: function (value) {
            this.deathScene = value;
            if (this.deathScene) {
                this.corpseBlurFilter.blur = 0;
                var clm = new PIXI.filters.ColorMatrixFilter();
                clm.sepia();
                this.backSprite.filters = [clm];
            }
            else {
                this.backSprite.filters = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    CutScene.prototype.SetBackGround = function (texture, scale) {
        if (!this.backSprite) {
            this.backSprite = new PIXI.Sprite(texture);
            this.addChildAt(this.backSprite, 0);
        }
        else {
            this.backSprite.texture = texture;
        }
        this.backSprite.scale.set(1 / scale.x, 1 / scale.y); //  rescale to fit full scene
    };
    CutScene.prototype.SetText = function (text, style) {
        this.textMessage.text = text;
        if (style) {
            this.textMessage.style = new PIXI.TextStyle(style);
        }
    };
    return CutScene;
}(Scene_1.Scene));
exports.CutScene = CutScene;


/***/ }),

/***/ "./scenes/LoaderScene.ts":
/*!*******************************!*\
  !*** ./scenes/LoaderScene.ts ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var LevelHelper_1 = __webpack_require__(/*! ../world/LevelHelper */ "./world/LevelHelper.ts");
var PlayerStats_1 = __webpack_require__(/*! ../objects/PlayerStats */ "./objects/PlayerStats.ts");
var constants_1 = __webpack_require__(/*! ../constants */ "./constants.ts");
var MasterHud_1 = __webpack_require__(/*! ../objects/MasterHud */ "./objects/MasterHud.ts");
var MainScene_1 = __webpack_require__(/*! ./MainScene */ "./scenes/MainScene.ts");
var OptionsScene_1 = __webpack_require__(/*! ./OptionsScene */ "./scenes/OptionsScene.ts");
var CutScene_1 = __webpack_require__(/*! ./CutScene */ "./scenes/CutScene.ts");
var LoaderScene = /** @class */ (function (_super) {
    tslib_1.__extends(LoaderScene, _super);
    function LoaderScene(scm) {
        var _this = _super.call(this, scm, "Loader") || this;
        _this.preloadAssets = [
            //  gui stuff
            'assets/gui-atlas.json',
            // 'assets/gui/gui_fs_enter.png',
            // 'assets/gui/gui_fs_exit.png',
            // 'assets/gui/gui_options.png',
            // 'assets/gui/gui_back.png',
            // 'assets/gui/gui_button1.png',
            // 'assets/gui/gui_slider1.png', 
            // 'assets/gui/gui_minus.png',  
            // 'assets/gui/heart.png',
            // 'assets/gui/coin.png',
            // 'assets/gui/rect.png',
            // 'assets/gui/stat_panel.png',
            // 'assets/gui/exp_panel.png',
            // 'assets/gui/exp_prefill.png',
            // 'assets/gui/exp_fill.png',
            // 'assets/gui/panel.png',
            //
            'assets/hero.png',
            'assets/hero-dead.png',
            'assets/star.png',
            'assets/img/effects/flame.png',
            'assets/img/effects/jump_smoke.png',
            'assets/img/effects/load.png'
        ];
        _this.onUpdate = function (dt) {
            if (_this.spinner) {
                _this.spinner.rotation += 0.05;
            }
        };
        _this.onActivate = function () {
            console.log("downloading level " + PlayerStats_1.stats.currentGameLevel + "...");
            var assets = LevelHelper_1.GetLevelAssets(__1.Global.LevelDefinitions, PlayerStats_1.stats.currentGameLevel);
            assets = assets.concat(_this.preloadAssets);
            __1.PIXI.loader
                .reset()
                .add(assets)
                .load(_this.handleLevelLoading)
                .on("progress", _this.onProgress);
        };
        _this.handleLevelLoading = function () {
            if (!_this.sceneManager.HasScene("Main")) {
                console.log('adding scenes...');
                _this.sceneManager.AddScene(new MainScene_1.MainScene(_this.sceneManager));
                _this.sceneManager.AddScene(new OptionsScene_1.OptionsScene(_this.sceneManager));
                _this.sceneManager.AddScene(new CutScene_1.CutScene(_this.sceneManager));
                _this.sceneManager.MasterHudOverlay = new MasterHud_1.MasterHud(_this.sceneManager);
                ;
            }
            try {
                var mainScene = _this.sceneManager.GetScene("Main");
                mainScene.startLevel();
            }
            catch (e) {
                console.log("exception: ", e);
            }
        };
        _this.onProgress = function (loader, resource) {
            var progress = loader.progress;
            console.log("progress: " + progress.toFixed(0) + "%, asset: " + resource.name);
            _this.loadingMessage.text = "Loading " + progress.toFixed(0) + " %";
        };
        _this.BackGroundColor = 0;
        _this.loadingMessage = new __1.PIXI.Text("loading ...", {
            fontSize: 36,
            fontFamily: "Permanent Marker",
            fill: 0x0ff00,
            dropShadow: true,
            align: "center",
            stroke: 0x44ff44,
            strokeThickness: 1
        });
        _this.loadingMessage.anchor.set(0.5, 0.5);
        _this.loadingMessage.position.set(constants_1.SCENE_HALF_WIDTH, constants_1.SCENE_HALF_HEIGHT - 80);
        _this.addChild(_this.loadingMessage);
        var loadingTexture = __1.PIXI.Texture.fromImage("assets/loading.png");
        _this.spinner = new __1.PIXI.Sprite(loadingTexture);
        _this.spinner.position.set(constants_1.SCENE_HALF_WIDTH, constants_1.SCENE_HALF_HEIGHT);
        _this.spinner.anchor.set(0.5, 0.5);
        _this.spinner.scale.set(0.5);
        _this.addChild(_this.spinner);
        return _this;
    }
    return LoaderScene;
}(__1.Scene));
exports.LoaderScene = LoaderScene;


/***/ }),

/***/ "./scenes/MainScene.ts":
/*!*****************************!*\
  !*** ./scenes/MainScene.ts ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var p2 = __webpack_require__(/*! p2 */ "./node_modules/p2/src/p2.js");
var TWEEN = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/src/Tween.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var WorldP2_1 = __webpack_require__(/*! ../world/WorldP2 */ "./world/WorldP2.ts");
var HeroCharacter_1 = __webpack_require__(/*! ../objects/HeroCharacter */ "./objects/HeroCharacter.ts");
var StatsHud_1 = __webpack_require__(/*! ../objects/StatsHud */ "./objects/StatsHud.ts");
var PlayerStats_1 = __webpack_require__(/*! ../objects/PlayerStats */ "./objects/PlayerStats.ts");
var Bullet_1 = __webpack_require__(/*! ../objects/Bullet */ "./objects/Bullet.ts");
var events_1 = __webpack_require__(/*! ../events */ "./events.ts");
var constants_1 = __webpack_require__(/*! ../constants */ "./constants.ts");
var Lava_1 = __webpack_require__(/*! ../objects/Lava */ "./objects/Lava.ts");
var LevelLoader_1 = __webpack_require__(/*! ../world/LevelLoader */ "./world/LevelLoader.ts");
var Platform_1 = __webpack_require__(/*! ../objects/Platform */ "./objects/Platform.ts");
var Bumper_1 = __webpack_require__(/*! ../objects/Bumper */ "./objects/Bumper.ts");
var SoundMan_1 = __webpack_require__(/*! ../world/SoundMan */ "./world/SoundMan.ts");
var QuestManager_1 = __webpack_require__(/*! ../questSystem/QuestManager */ "./questSystem/QuestManager.ts");
var enums_1 = __webpack_require__(/*! ../enums */ "./enums.ts");
var MainScene = /** @class */ (function (_super) {
    tslib_1.__extends(MainScene, _super);
    function MainScene(scm) {
        var _this = _super.call(this, scm, "Main") || this;
        _this.shakeDuration = 0;
        _this.shakeEnd = 0;
        _this.nextShake = 0;
        _this.magnitude = 0;
        _this.SHAKE_COUNT = 15;
        _this.startGroundShake = function (event) {
            _this.shakeEnd = performance.now() + event.milliSeconds;
            _this.magnitude = event.magnitudeInPixels;
            _this.shakeDuration = event.milliSeconds / _this.SHAKE_COUNT;
        };
        _this.BackGroundColor = constants_1.SCENE_BACKCOLOR;
        _this.setup();
        return _this;
    }
    MainScene.prototype.onUpdate = function (dt) {
        //-------------------------------------------
        //  update world & world container position
        //-------------------------------------------        
        WorldP2_1.wp2.update(dt);
        this.worldContainer.x = (constants_1.SCENE_HALF_WIDTH - this.hero.x);
        this.worldContainer.y = (constants_1.SCENE_HEIGHT - 70);
        //-------------------------------------------
        //  update parallax
        //-------------------------------------------
        PlayerStats_1.stats.currentLevel.parallax.forEach(function (p) {
            p.SetViewPortX(__1.Global.position.x);
            p.position.x = __1.Global.position.x - constants_1.SCENE_HALF_WIDTH;
        });
        //-------------------------------------------
        //  update entities position
        //-------------------------------------------
        var bodies = WorldP2_1.wp2.bodies;
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i];
            var displayObject = body.DisplayObject;
            if (displayObject && displayObject.visible && body.type !== p2.Body.STATIC) {
                displayObject.position.set(Math.floor(body.interpolatedPosition[0]), Math.floor(body.interpolatedPosition[1]));
                displayObject.rotation = body.interpolatedAngle;
            }
            if (body.Trigger && body.Trigger.type === "distance") {
                if (this.questMngr.canActivateTrigger(body.Trigger)) {
                    var x = this.hero.position.x - body.position[0];
                    var y = this.hero.position.y - body.position[1];
                    var distance = Math.sqrt(x * x + y * y);
                    if (body.Trigger.distance >= distance) {
                        this.questMngr.handleTriggerEvent(body);
                    }
                }
            }
        }
        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        for (var i = 0, len = WorldP2_1.wp2.playerContacts.length; i < len; i++) {
            var body = WorldP2_1.wp2.playerContacts[i];
            if (body.DisplayObject && body.DisplayObject.interactionType) {
                this.handleInteractiveCollision(body);
            }
            if (body.Trigger && body.Trigger.type === "collision") {
                this.questMngr.handleTriggerEvent(body);
            }
        }
        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        for (var i = 0, len = this.worldContainer.children.length; i < len; i++) {
            var child = this.worldContainer.children[i];
            if (child && child.onUpdate) {
                child.onUpdate(dt);
            }
        }
        ;
        //-------------------------------------------
        //  Spawn points
        //-------------------------------------------
        for (var i = 0, len = PlayerStats_1.stats.currentLevel.spawnPoints.length; i < len; i++) {
            PlayerStats_1.stats.currentLevel.spawnPoints[i].onUpdate(dt);
        }
        this.hud.onUpdate(dt);
        PlayerStats_1.stats.onUpdate(dt);
        var now = performance.now();
        //-------------------------------------------
        //  check if player is dead
        //-------------------------------------------
        if (PlayerStats_1.stats.getStat(enums_1.StatType.HP) <= 0) {
            this.IsHeroInteractive = false;
            this.hero.visible = false;
            var cutScene = this.sceneManager.GetScene("CutScene");
            var backGroundTexture = this.sceneManager.CaptureScene();
            cutScene.SetBackGround(backGroundTexture, this.scale);
            cutScene.DeathScene = true;
            this.sceneManager.ActivateScene(cutScene);
        }
        else if (this.shakeEnd >= now) {
            if (this.nextShake <= now) {
                //  original start position
                var x = (constants_1.SCENE_HALF_WIDTH - this.hero.x);
                var y = (constants_1.SCENE_HEIGHT - 70);
                this.shakeX = x + this.randomRange(-this.magnitude / 2, this.magnitude / 2);
                this.shakeY = y + this.randomRange(-this.magnitude, this.magnitude);
                //console.log("shake: " + this.shakeX + ", " + this.shakeY, this.magnitude, this.shakeEnd);
                //  reduce for next shake
                this.magnitude -= this.magnitude / this.SHAKE_COUNT;
                this.nextShake = now + this.shakeDuration;
            }
            this.worldContainer.x = this.shakeX;
            this.worldContainer.y = this.shakeY;
        }
    };
    MainScene.prototype.setup = function () {
        this.worldContainer = new __1.PIXI.Container();
        this.worldContainer.scale.y = -1;
        this.addChild(this.worldContainer);
        __1.Global.worldContainer = this.worldContainer;
        //-----------------------------
        //  setup hero 
        //-----------------------------     
        this.hero = new HeroCharacter_1.HeroCharacter(this.worldContainer);
        this.hero.name = "hero";
        this.hero.x = constants_1.SCENE_HALF_WIDTH;
        this.worldContainer.addChild(this.hero);
        this.hero.play("idle", constants_1.ANIMATION_FPS_SLOW);
        //--------------------------------------
        //  setup hud's
        //--------------------------------------
        this.hud = new StatsHud_1.StatsHud();
        this.HudOverlay = this.hud;
        //--------------------------------------
        //  register custom entity factories
        //--------------------------------------
        LevelLoader_1.LevelLoader.registerFactory("Lava", function (def) { return new Lava_1.Lava(def.texture); });
        LevelLoader_1.LevelLoader.registerFactory("Platform", function (def) {
            if (typeof def.texture === "string") {
                return new Platform_1.Platform(def.tilesX || 1, 1, [def.texture]);
            }
            else {
                return new Platform_1.Platform(def.tilesX || 1, def.tilesY || 1, def.texture);
            }
        });
        LevelLoader_1.LevelLoader.registerFactory("Bumper", function (def) { return new Bumper_1.Bumper(); });
        this.questMngr = new QuestManager_1.QuestManager(this);
        events_1.eventEmitter.on(events_1.BURN_TOPIC, function (event) { return event.isBurning ? SoundMan_1.snd.burn() : SoundMan_1.snd.burnStop(); });
        events_1.eventEmitter.on(events_1.GROUND_SHAKE, this.startGroundShake);
    };
    MainScene.prototype.startLevel = function () {
        var _this = this;
        this.clearLevel();
        //--------------------------------------
        //  test level loading
        //  TODO: this should be via user save file
        //--------------------------------------
        PlayerStats_1.stats.loadLevel();
        SoundMan_1.snd.playTrack(PlayerStats_1.stats.currentLevel.audioTrack || 0);
        PlayerStats_1.stats.currentLevel.parallax.forEach(function (plx, idx) {
            _this.worldContainer.addChildAt(plx, idx);
            plx.SetViewPortX(PlayerStats_1.stats.currentLevel.start[0]);
        });
        //--------------------------------------
        //  add all objects from level to scene
        //--------------------------------------
        PlayerStats_1.stats.currentLevel.entities.forEach(function (body) {
            _this.worldContainer.addChild(body.DisplayObject);
            //  if entity is a simple sprite it has a "fake" body  
            //  without any shapes, so no need to add it to world
            if (body.shapes && body.shapes.length > 0) {
                WorldP2_1.wp2.addBody(body);
            }
        });
        //  set start for player
        WorldP2_1.wp2.playerBody.position[0] = PlayerStats_1.stats.currentLevel.start[0];
        WorldP2_1.wp2.playerBody.position[1] = PlayerStats_1.stats.currentLevel.start[1];
        this.questMngr.reset();
        this.hero.visible = true;
        this.IsHeroInteractive = true;
        this.hud.visible = true;
        this.sceneManager.ActivateScene(this);
    };
    Object.defineProperty(MainScene.prototype, "IsHeroInteractive", {
        /**
         * Sets player interactivity.
         */
        set: function (value) {
            if (this.hero.IsInteractive !== value) {
                this.hero.IsInteractive = value;
                if (!this.hero.IsInteractive) {
                    this.hero.play("idle", constants_1.ANIMATION_FPS_SLOW);
                    SoundMan_1.snd.idle();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts an animation tween and removes the display object & body from scene.
     * @param dispObj
     */
    MainScene.prototype.collectObject = function (body) {
        var _this = this;
        var dispObj = body.DisplayObject;
        var orgScaleX = dispObj.scale.x;
        var upX = dispObj.position.x + 45;
        var upY = dispObj.position.y + 160;
        var endX = dispObj.position.x - constants_1.SCENE_HALF_WIDTH;
        var endY = constants_1.SCENE_HEIGHT;
        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 150);
        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.5, y: orgScaleX + 0.5 }, 500)
            .easing(TWEEN.Easing.Linear.None);
        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 2000)
            .easing(TWEEN.Easing.Back.In)
            .onComplete(function () { return _this.worldContainer.removeChild(dispObj); });
        moveUp.chain(scale, moveAway).start();
        this.removeEntity(body);
    };
    /**
     * Handles player collision with interactive objects.
     * @param body
     */
    MainScene.prototype.handleInteractiveCollision = function (body) {
        var dispObj = body.DisplayObject;
        var interactionType = body.DisplayObject.interactionType;
        switch (interactionType) {
            case 1: //  small coin
                PlayerStats_1.stats.increaseStat(enums_1.StatType.Coins, 1);
                this.collectObject(body);
                this.hud.addInfoMessage(dispObj.position, "+1 coin", constants_1.MSG_COIN_STYLE, -100);
                SoundMan_1.snd.coin();
                break;
            case 2: //  coin
                PlayerStats_1.stats.increaseStat(enums_1.StatType.Coins, 10);
                this.collectObject(body);
                this.hud.addInfoMessage(dispObj.position, "+10 coins", constants_1.MSG_COIN_STYLE, -100);
                SoundMan_1.snd.coin();
                break;
            case 3: //  blue gem
                PlayerStats_1.stats.increaseStat(enums_1.StatType.Coins, 100);
                this.collectObject(body);
                this.hud.addInfoMessage(dispObj.position, "+100 coins", constants_1.MSG_COIN_STYLE, -100);
                SoundMan_1.snd.gem();
                break;
            //------------------------------------
            //  QUEST ITEMS 200-999
            //------------------------------------
            case 201: //  kendo knowledge
                this.hud.addInfoMessage(dispObj.position, "Kendo knowledge acquired!", constants_1.MSG_COIN_STYLE);
                this.collectObject(body);
                SoundMan_1.snd.questItem();
                this.questMngr.acquireItem(201);
                break;
            case 202: //  KI
                this.hud.addInfoMessage(dispObj.position, "1 Ki acquired!", constants_1.MSG_COIN_STYLE);
                this.collectObject(body);
                SoundMan_1.snd.questItem();
                this.questMngr.acquireItem(202);
                //  TODO: quest manager
                break;
            //------------------------------------
            //  OBJECTS DOING DAMAGE 1000-1999
            //------------------------------------
            case enums_1.DamageType.LavaBorder: //  border lava   
                {
                    var now = performance.now() / 1000;
                    if (!PlayerStats_1.stats.buffs[enums_1.DamageType.LavaBorder] || PlayerStats_1.stats.buffs[enums_1.DamageType.LavaBorder] < now) {
                        this.hud.addInfoMessage(dispObj.position, "Burning", constants_1.MSG_WARN_STYLE, 100);
                    }
                    PlayerStats_1.stats.buffs[enums_1.DamageType.LavaBorder] = this.secondsFromNow(1);
                }
                break;
            case enums_1.DamageType.Lava: //  lava
                {
                    var now = performance.now() / 1000;
                    if (!PlayerStats_1.stats.buffs[enums_1.DamageType.Lava] || PlayerStats_1.stats.buffs[enums_1.DamageType.Lava] < now) {
                        this.hud.addInfoMessage(dispObj.position, "Burning", constants_1.MSG_WARN_STYLE, 100);
                    }
                    PlayerStats_1.stats.buffs[enums_1.DamageType.Lava] = this.secondsFromNow(4);
                }
                break;
        }
    };
    /**
     * Helper that returns time tick value with the given seconds added.
     * @param seconds
     */
    MainScene.prototype.secondsFromNow = function (seconds) {
        var now = performance.now() / 1000;
        now += seconds;
        return now;
    };
    /**
     * Removes an entity from the p2 world and sets its DisplayObject to null.
     * If the removeDisplayObject is true the display object will be also removed from the worldContainer.
     *
     * @param body
     * @param removeDisplayObject
     */
    MainScene.prototype.removeEntity = function (body, removeDisplayObject) {
        if (removeDisplayObject === void 0) { removeDisplayObject = false; }
        WorldP2_1.wp2.removeBody(body);
        if (removeDisplayObject) {
            this.worldContainer.removeChild(body.DisplayObject);
        }
        body.DisplayObject = null;
    };
    MainScene.prototype.clearLevel = function () {
        var _this = this;
        if (PlayerStats_1.stats.currentLevel) {
            PlayerStats_1.stats.currentLevel.parallax.forEach(function (plx, idx) {
                _this.worldContainer.removeChild(plx);
            });
            PlayerStats_1.stats.currentLevel.entities.forEach(function (body) {
                if (body !== WorldP2_1.wp2.playerBody) {
                    _this.worldContainer.removeChild(body.DisplayObject);
                    WorldP2_1.wp2.removeBody(body);
                    body.DisplayObject = null;
                }
            });
            //  now remove all other display objects except hero
            var all = this.worldContainer.children.filter(function (c) { return c.name !== "hero"; });
            all.forEach(function (child) {
                _this.worldContainer.removeChild(child);
            });
            WorldP2_1.wp2.clearLevel();
            Bullet_1.Bullet.reset();
        }
    };
    MainScene.prototype.randomRange = function (min, max) {
        return min + (Math.random() * (max - min));
    };
    return MainScene;
}(__1.Scene));
exports.MainScene = MainScene;


/***/ }),

/***/ "./scenes/OptionsScene.ts":
/*!********************************!*\
  !*** ./scenes/OptionsScene.ts ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var constants_1 = __webpack_require__(/*! ../constants */ "./constants.ts");
/**
 *   Main options GUI.
 */
var OptionsScene = /** @class */ (function (_super) {
    tslib_1.__extends(OptionsScene, _super);
    /**
     *   Creates a new scene instance.
     */
    function OptionsScene(scm) {
        var _this = _super.call(this, scm, "Options") || this;
        _this.currentMusicTrack = 0;
        _this.onActivate = function () {
            var btnOptions = _this.sceneManager.MasterHudOverlay.children.find(function (obj, idx) { return obj.name == "BTN_OPTIONS"; });
            btnOptions.visible = false;
        };
        _this.onDeactivate = function () {
            var btnOptions = _this.sceneManager.MasterHudOverlay.children.find(function (obj, idx) { return obj.name == "BTN_OPTIONS"; });
            btnOptions.visible = true;
        };
        _this.setup = function () {
            var title = new __1.PIXI.Text("Options", constants_1.TEXT_STYLE);
            _this.addChild(title);
            title.anchor.set(0.5);
            title.x = constants_1.SCENE_HALF_WIDTH;
            title.y = 20;
            var OFFSET = constants_1.BTN_WIDTH / 3;
            var y = constants_1.SCENE_HEIGHT - constants_1.BTN_HEIGHT - OFFSET;
            //--------------------
            //  back to game
            //--------------------
            var btnBack = new __1.Button("assets/gui-atlas.json@gui_button1.png", OFFSET, y, constants_1.BTN_WIDTH, constants_1.BTN_HEIGHT);
            btnBack.text = new __1.PIXI.Text("Back to game", constants_1.BTN_STYLE);
            btnBack.onClick = function () {
                //this.resetSounds();
                _this.sceneManager.ActivatePreviousScene();
            };
            _this.addChild(btnBack);
        };
        _this.BackGroundColor = constants_1.SCENE_BACKCOLOR;
        _this.setup();
        return _this;
    }
    return OptionsScene;
}(__1.Scene));
exports.OptionsScene = OptionsScene;


/***/ }),

/***/ "./world/CollisionGroups.ts":
/*!**********************************!*\
  !*** ./world/CollisionGroups.ts ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.COL_GRP_PLAYER = 1;
exports.COL_GRP_NPC = 2;
exports.COL_GRP_SCENE = 4;
exports.COL_GRP_BULLET = 8;
exports.COL_GRP_GROUND = 16;


/***/ }),

/***/ "./world/LevelHelper.ts":
/*!******************************!*\
  !*** ./world/LevelHelper.ts ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/**
* Returns all assets referenced in the level.
* @param root
* @param levelId
*/
function GetLevelAssets(root, levelId) {
    var assets = [];
    var level = undefined;
    for (var i = 0; i < root.levels.length; i++) {
        if (root.levels[i].id === levelId) {
            level = root.levels[i];
            break;
        }
    }
    if (level) {
        level.parallax.forEach(function (iplx) {
            assets = assets.concat(iplx.textures);
        });
        if (level.assets && level.assets.length > 0) {
            assets = assets.concat(level.assets);
        }
        //  merge global templates with level templates
        var templates = root.templates.concat(level.map.templates);
        // add all textures from templates (we don't need to have entities referencing the template if they are in a spawn)
        level.map.templates.forEach(function (tos) {
            if (!tos.type || tos.type !== "spawn_point") {
                var templ = tos;
                var dispObj = templ.displayObject;
                if (dispObj.texture) {
                    if (typeof dispObj.texture === "string") {
                        assets.push(dispObj.texture);
                    }
                    else {
                        assets = assets.concat(dispObj.texture);
                    }
                }
                if (dispObj.sequences) {
                    dispObj.sequences.forEach(function (item) {
                        assets.push(item.texture);
                    });
                }
            }
        });
        level.map.entities.forEach(function (entity) {
            var defs = getEntityDefinition(templates, entity);
            if (defs.doDef.texture) {
                if (typeof defs.doDef.texture === "string") {
                    assets.push(defs.doDef.texture);
                }
                else {
                    assets = assets.concat(defs.doDef.texture);
                }
            }
            if (defs.doDef.sequences) {
                defs.doDef.sequences.forEach(function (item) {
                    assets.push(item.texture);
                });
            }
        });
        level.map.NPC = level.map.NPC || [];
        level.map.NPC.forEach(function (tos) {
            //  check if its a template or spawn_point
            if (tos.type && tos.type === "spawn_point") {
            }
            else {
                //  this is an entity definition
                var entity_1 = tos;
                //  concat attack (string | string[])
                if (entity_1.attack) {
                    assets = assets.concat(entity_1.attack);
                }
                var entityTemplate = templates.filter(function (item) { return item.name === entity_1.template; });
                if (entityTemplate && entityTemplate.length > 0) {
                    var template = entityTemplate[0];
                    // var temp = $.extend(true, {}, template.displayObject);
                    // var displayObjectDefinition = $.extend(temp, entity);
                    var displayObjectDefinition = tslib_1.__assign({}, template.displayObject, entity_1);
                    if (displayObjectDefinition.texture) {
                        if (typeof displayObjectDefinition.texture === "string") {
                            assets.push(displayObjectDefinition.texture);
                        }
                        else {
                            assets = assets.concat(displayObjectDefinition.texture);
                        }
                    }
                    if (displayObjectDefinition.attack) {
                        assets = assets.concat(displayObjectDefinition.attack);
                    }
                    if (displayObjectDefinition.sequences) {
                        displayObjectDefinition.sequences.forEach(function (item) {
                            //  add only if texture exists
                            if (item.texture) {
                                assets.push(item.texture);
                            }
                        });
                    }
                }
            }
        });
    }
    //  convert json atlas prefixed texture names to only json file names
    assets = assets.map(function (name) {
        var idx = name.indexOf('.json@');
        return idx > 0 ? name.substr(0, idx + 5) : name;
    });
    assets = getUniqueItems(assets);
    return assets;
}
exports.GetLevelAssets = GetLevelAssets;
/**
* Returns an object containing extracted display object and body definitions.
* @param templates
* @param entity
*/
function getEntityDefinition(templates, entity) {
    var displayObjectDefinition = null;
    var bodyDefinition = null;
    var template = {
        name: null,
        displayObject: { typeName: "Sprite" },
        body: null,
        trigger: null,
        drop: null
    };
    var entityTemplate = templates.filter(function (item) { return item.name === entity.template; });
    if (entityTemplate && entityTemplate.length > 0) {
        template = entityTemplate[0];
    }
    displayObjectDefinition = tslib_1.__assign({}, template.displayObject, entity);
    if (template.drop) {
        displayObjectDefinition = tslib_1.__assign({}, displayObjectDefinition, { drop: template.drop });
    }
    if (template.body) {
        bodyDefinition = template.body;
    }
    var triggerTemplate = undefined;
    if (template.trigger || displayObjectDefinition.trigger) {
        triggerTemplate = tslib_1.__assign({}, template.trigger, displayObjectDefinition.trigger);
    }
    return {
        templateName: template.name,
        doDef: displayObjectDefinition,
        bdDef: bodyDefinition,
        trigger: triggerTemplate
    };
}
exports.getEntityDefinition = getEntityDefinition;
/**
 * Returns a filtered array with unique only items from the input array
 * @param arr
 */
function getUniqueItems(arr) {
    var n = {}, r = [];
    for (var i = 0; i < arr.length; i++) {
        if (!n[arr[i]]) {
            n[arr[i]] = true;
            r.push(arr[i]);
        }
    }
    return r;
}
exports.getUniqueItems = getUniqueItems;


/***/ }),

/***/ "./world/LevelLoader.ts":
/*!******************************!*\
  !*** ./world/LevelLoader.ts ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Global = __webpack_require__(/*! ../global */ "./global.ts");
var p2 = __webpack_require__(/*! p2 */ "./node_modules/p2/src/p2.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var CollisionGroups_1 = __webpack_require__(/*! ./CollisionGroups */ "./world/CollisionGroups.ts");
var SpawnPoint_1 = __webpack_require__(/*! ../mobs/SpawnPoint */ "./mobs/SpawnPoint.ts");
var Mob_1 = __webpack_require__(/*! ../mobs/Mob */ "./mobs/Mob.ts");
var LevelHelper_1 = __webpack_require__(/*! ./LevelHelper */ "./world/LevelHelper.ts");
var constants_1 = __webpack_require__(/*! ../constants */ "./constants.ts");
var _engine_1 = __webpack_require__(/*! ../_engine */ "./_engine/index.ts");
var LevelLoader = /** @class */ (function () {
    function LevelLoader(gameLevels) {
        this.gameLevels = gameLevels;
    }
    /**
     * Registers custom factory function for creating display objects.
     * @param name the entity name used in level definition
     * @param factory factory function returning a display object based on the given definition
     */
    LevelLoader.registerFactory = function (name, factory) {
        this.factoryList.set(name, factory);
    };
    /**
     * Loads the level.
     * @param name
     * @param container
     */
    LevelLoader.prototype.buildLevel = function (id) {
        //  find the level by its id
        var levelDefinition = undefined;
        for (var i = 0; i < this.gameLevels.levels.length; i++) {
            if (this.gameLevels.levels[i].id === id) {
                levelDefinition = this.gameLevels.levels[i];
                break;
            }
        }
        //  create level objects
        var result;
        if (levelDefinition) {
            result = this.createLevel(levelDefinition);
        }
        return result;
    };
    LevelLoader.prototype.createLevel = function (level) {
        var result = {
            parallax: [],
            entities: [],
            start: [],
            audioTrack: level.audioTrack,
            templates: [],
            spawnPoints: []
        };
        //--------------------------------------
        //  create parallax objects
        //--------------------------------------            
        var vps = new PIXI.Point(constants_1.SCENE_WIDTH, constants_1.SCENE_HEIGHT);
        level.parallax.forEach(function (iplx) {
            var parallax = new __1.Parallax(vps, iplx.parallaxFactor, iplx.textures, iplx.scale);
            parallax.y = iplx.y;
            result.parallax.push(parallax);
        });
        //--------------------------------------
        //  merge global with level templates
        //--------------------------------------
        var templates = Global.LevelDefinitions.templates.concat(level.map.templates);
        result.templates = templates;
        //--------------------------------------
        //  create display/physics object pairs
        //--------------------------------------
        level.map.entities.forEach(function (entity, idx, arr) {
            var p2body = LevelLoader.createEntity(templates, entity);
            result.entities.push(p2body);
        });
        //--------------------------------------
        //  create NPC's
        //--------------------------------------
        level.map.NPC = level.map.NPC || [];
        level.map.NPC.forEach(function (npc, idx, arr) {
            if (npc.type && npc.type === "spawn_point") {
                var sp = npc;
                var entity = sp.entity;
                result.spawnPoints.push(new SpawnPoint_1.SpawnPoint(sp.name, sp.xy[0], sp.xy[1], sp.area, sp.maxMobCount, sp.respawnSeconds, entity));
            }
            else {
                var p2body = LevelLoader.createMob(templates, npc);
                result.entities.push(p2body);
            }
        });
        result.start = level.map.start;
        return result;
    };
    LevelLoader.createEntity = function (templates, entity) {
        var defs = LevelHelper_1.getEntityDefinition(templates, entity);
        //  display object
        var dispObj = LevelLoader.buildDisplayObject(defs.doDef);
        dispObj.name = entity.name || entity.template;
        dispObj.templateName = defs.templateName;
        //  body
        var p2body;
        if (defs.bdDef) {
            p2body = LevelLoader.buildPhysicsObject(defs.bdDef, dispObj);
            p2body.shapes.every(function (s) {
                if (defs.bdDef.collisionType === "ground") {
                    s.collisionGroup = CollisionGroups_1.COL_GRP_GROUND;
                    s.collisionMask = CollisionGroups_1.COL_GRP_PLAYER | CollisionGroups_1.COL_GRP_NPC | CollisionGroups_1.COL_GRP_SCENE | CollisionGroups_1.COL_GRP_BULLET;
                }
                else {
                    s.collisionGroup = CollisionGroups_1.COL_GRP_SCENE;
                    s.collisionMask = CollisionGroups_1.COL_GRP_PLAYER | CollisionGroups_1.COL_GRP_NPC | CollisionGroups_1.COL_GRP_SCENE | CollisionGroups_1.COL_GRP_GROUND;
                }
                return true;
            });
            p2body.DisplayObject = dispObj;
            //  trigger
            if (defs.trigger) {
                p2body.Trigger = defs.trigger;
            }
        }
        else {
            p2body = new p2.Body();
            p2body.DisplayObject = dispObj;
        }
        return p2body;
    };
    LevelLoader.createMob = function (templates, entity) {
        var defs = LevelHelper_1.getEntityDefinition(templates, entity);
        //  display object
        var mobDispObj = LevelLoader.buildDisplayObject(defs.doDef);
        mobDispObj.name = entity.name || entity.template;
        mobDispObj.templateName = defs.templateName;
        // attributes and AI
        mobDispObj.attributes = entity.attributes || defs.doDef.attributes || [];
        mobDispObj.createAI(entity.ai || "basic_static");
        mobDispObj.atkTexture = entity.attack || defs.doDef.attack;
        //  body        
        defs.bdDef.material = defs.bdDef.material || "mob_default";
        var p2body = LevelLoader.buildPhysicsObject(defs.bdDef, mobDispObj);
        p2body.shapes.every(function (s) {
            s.collisionGroup = CollisionGroups_1.COL_GRP_NPC;
            s.collisionMask = CollisionGroups_1.COL_GRP_PLAYER | CollisionGroups_1.COL_GRP_GROUND | CollisionGroups_1.COL_GRP_SCENE;
            return true;
        });
        p2body.DisplayObject = mobDispObj;
        //  trigger
        if (defs.trigger) {
            p2body.Trigger = defs.trigger;
        }
        return p2body;
    };
    /**
     * Creates a display object from the definition.
     * @param definition
     */
    LevelLoader.buildDisplayObject = function (definition) {
        var dispObj;
        switch (definition.typeName) {
            case "Mob":
                var mob_1 = new Mob_1.Mob(definition.texture);
                //  if animations are defined in the json replace the built-in mob animations
                if (definition.sequences) {
                    mob_1.clearAnimations();
                    definition.sequences.forEach(function (seq) {
                        var textureName = seq.texture || definition.texture;
                        var aseq = new __1.AnimationSequence(seq.name, textureName, seq.frames, seq.framesize[0], seq.framesize[1]);
                        mob_1.addAnimations(aseq);
                    });
                    mob_1.play(definition.sequences[0].name);
                }
                if (definition.fps) {
                    mob_1.fps = definition.fps;
                }
                mob_1.anchor.set(0.5, 0.5);
                mob_1.typeName = "Mob";
                dispObj = mob_1;
                break;
            case "Sensor":
                dispObj = new PIXI.DisplayObject();
                dispObj.typeName = "Sensor";
                break;
            case "AnimatedSprite":
                var aspr = new __1.AnimatedSprite();
                definition.sequences.forEach(function (seq, idx, arr) {
                    var aseq = new __1.AnimationSequence(seq.name, seq.texture, seq.frames, seq.framesize[0], seq.framesize[1]);
                    aspr.addAnimations(aseq);
                });
                aspr.play(definition.sequences[0].name, definition.fps);
                aspr.anchor.set(0.5, 0.5);
                aspr.typeName = "AnimatedSprite";
                dispObj = aspr;
                break;
            case "Sprite":
                var sprTexture = _engine_1.TextureLoader.Get(definition.texture);
                var spr = new PIXI.Sprite(sprTexture);
                if (definition.anchor === undefined)
                    definition.anchor = 0.5;
                spr.anchor.set(definition.anchor);
                if (definition.pivot === undefined)
                    definition.pivot = 0.5;
                if (definition.scale === undefined)
                    definition.scale = [1, -1];
                spr.pivot.set(definition.pivot);
                spr.typeName = "Sprite";
                dispObj = spr;
                break;
            // case "Balloon":
            //     var bln = new Balloon();
            //     dispObj = bln;
            //     break;
            // case "Bumper":
            //     var bmp = new Bumper();
            //     bmp.anchor.set(0.5);
            //     dispObj = bmp;
            //     break;
            default:
                var factory = this.factoryList.get(definition.typeName);
                if (factory)
                    dispObj = factory(definition);
                else
                    throw "Factory not found for object name: " + definition.typeName;
                break;
        }
        if (definition.visible !== undefined) {
            dispObj.visible = definition.visible;
        }
        dispObj.rotation = definition.rotation || 0;
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
        }
        if (definition.scale) {
            dispObj.scale.set(definition.scale[0], definition.scale[1]);
        }
        if (definition.interactionType) {
            dispObj.interactionType = definition.interactionType;
        }
        if (definition.drop) {
            dispObj.drop = definition.drop;
        }
        if (definition.tint) {
            dispObj.tint = parseInt(definition.tint, 16);
        }
        return dispObj;
    };
    /**
     * Creates a physics body and shape from the definition.
     * @param definition
     * @param dispObj the display object to retrieve the defaults from.
     * @param preventSensor if true a non sensor body will be created (this is to support mobs
     *                      that must have normal bodies but also an interactionType.
     */
    LevelLoader.buildPhysicsObject = function (definition, dispObj, preventSensor) {
        if (preventSensor === void 0) { preventSensor = false; }
        var body;
        var w = 0, h = 0;
        if (definition) {
            var options = {
                mass: definition.mass,
                position: definition.xy ? definition.xy : [dispObj.x, dispObj.y],
                angle: definition.angle || dispObj.rotation,
                fixedRotation: definition.fixedRotation || false,
                angularDamping: definition.angularDamping || 0.1,
                damping: definition.damping || 0.1,
            };
            body = new p2.Body(options);
            body.type = definition.type || p2.Body.KINEMATIC; /* DYNAMIC = 1, DYNAMIC = 1, STATIC = 2 */
            var dispObjAsAny = dispObj;
            var shape;
            switch (definition.shape) {
                case "Circle":
                    var radius = 32;
                    if (definition.size) {
                        if (definition.size.constructor === Array) {
                            radius = definition.size[0];
                        }
                        else {
                            radius = definition.size;
                        }
                    }
                    else {
                        radius = dispObjAsAny.width;
                    }
                    shape = new p2.Circle({ radius: radius });
                    break;
                case "Platform":
                    if (definition.size) {
                        w = definition.size[0];
                        h = definition.size[1];
                    }
                    else {
                        w = Math.abs(dispObjAsAny.width);
                        h = Math.abs(dispObjAsAny.height);
                    }
                    shape = new p2.Box({
                        width: w,
                        height: h,
                    });
                    //  the position is centered but we need it to be left top aligned
                    body.position[0] = body.position[0] + w / 2;
                    body.position[1] = body.position[1] - h / 2;
                    break;
                case "Box":
                    //  get the size
                    if (definition.size) {
                        w = definition.size[0];
                        h = definition.size[1];
                    }
                    else {
                        if (dispObjAsAny.width) {
                            w = Math.abs(dispObjAsAny.width);
                            h = Math.abs(dispObjAsAny.height);
                        }
                        else {
                            //  TODO: check this - seems not to get correct bounds
                            w = dispObj.scale.x * dispObj.getLocalBounds().width;
                            h = dispObj.scale.y * dispObj.getLocalBounds().height;
                        }
                    }
                    shape = new p2.Box({
                        width: w,
                        height: h,
                    });
                    break;
                //  TODO: implement other shapes if needed
            }
            if (definition.material) {
                shape.materialName = definition.material;
            }
            if (!preventSensor && !!dispObj.interactionType) {
                shape.sensor = true;
                body.type = p2.Body.STATIC;
                body.collisionResponse = false;
                body.setDensity(0.0); //   this is to prevent body impacts on player collide (makes no sense as it is a sensor, bug maybe?)
                console.log("created collectible sensor", shape);
            }
            else if (dispObj.typeName === "Sensor") {
                shape.sensor = true;
                body.type = p2.Body.STATIC;
                body.collisionResponse = false;
                body.setDensity(0.0);
            }
            body.addShape(shape);
        }
        return body;
    };
    LevelLoader.factoryList = new _engine_1.Dictionary();
    return LevelLoader;
}());
exports.LevelLoader = LevelLoader;


/***/ }),

/***/ "./world/SoundMan.ts":
/*!***************************!*\
  !*** ./world/SoundMan.ts ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var howler_1 = __webpack_require__(/*! howler */ "./node_modules/howler/dist/howler.js");
var SoundMan = /** @class */ (function () {
    function SoundMan() {
        this.musicTrackNames = [
            'assets/audio/Two-Finger-Johnny.mp3',
            'assets/audio/Bumbling-Burglars_Looping.mp3',
            'assets/audio/Bama-Country.mp3',
            'assets/audio/Beachfront-Celebration.mp3',
            'assets/audio/Easy-Jam.mp3',
            'assets/audio/Whiskey-on-the-Mississippi.mp3',
            'assets/audio/ZigZag.mp3',
            'assets/audio/Carrousel.mp3',
            'assets/audio/Disco-Break.mp3'
        ];
        this.musicTracks = [];
        this.currentTrack = 0;
        this.previousMusicVolume = 0.6;
        this.previousFxVolume = 1;
        this.musicVolume = 0.6;
        this.fxVolume = 1;
        for (var i = 0, len = this.musicTrackNames.length; i < len; i++) {
            var trackName = this.musicTrackNames[i];
            this.musicTracks.push(new howler_1.Howl({
                src: [trackName],
                autoplay: false,
                loop: true,
                volume: 0.6
            }));
        }
        this.walkSnd = new howler_1.Howl({
            src: ['assets/audio/effects/step.mp3'],
            preload: true,
            autoplay: false,
            loop: true,
            volume: 1,
        });
        this.jumpSnd1 = new howler_1.Howl({
            src: ['assets/audio/effects/jump1.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.jumpSnd2 = new howler_1.Howl({
            src: ['assets/audio/effects/jump2.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.burnSnd = new howler_1.Howl({
            src: ['assets/audio/effects/burn.mp3'],
            preload: true,
            autoplay: false,
            loop: true,
            volume: 1
        });
        this.hurtSnd = new howler_1.Howl({
            src: ['assets/audio/effects/hurt.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.coinSnd = new howler_1.Howl({
            src: ['assets/audio/effects/coin.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.gemSnd = new howler_1.Howl({
            src: ['assets/audio/effects/gem.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.questItemSnd = new howler_1.Howl({
            src: ['assets/audio/effects/quest-item.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.winSnd = new howler_1.Howl({
            src: ['assets/audio/effects/win.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.atkMag1 = new howler_1.Howl({
            src: ['assets/audio/effects/atk-mag01.mp3'],
            autoplay: false,
            loop: false,
            volume: 1,
        });
        this.hitMag1 = new howler_1.Howl({
            src: ['assets/audio/effects/hit-mag01.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.jumpAtk = new howler_1.Howl({
            src: ['assets/audio/effects/jump-atk01.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.pain = new howler_1.Howl({
            src: ['assets/audio/effects/pain01.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.jmpContact = new howler_1.Howl({
            src: ['assets/audio/effects/jmp-contact.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.woosh = new howler_1.Howl({
            src: ['assets/audio/effects/woosh.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.squish = new howler_1.Howl({
            src: ['assets/audio/effects/mob-squish.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.fxDemoSnd = new howler_1.Howl({
            src: ['assets/audio/effects/fx-demo.mp3'],
            autoplay: false,
            loop: false,
            volume: 1
        });
    }
    Object.defineProperty(SoundMan.prototype, "MusicVolume", {
        get: function () { return this.musicVolume; },
        set: function (value) {
            this.musicVolume = value;
            if (this.backgroundSnd && this.backgroundSnd.playing()) {
                this.backgroundSnd.volume(this.musicVolume);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundMan.prototype, "FxVolume", {
        get: function () { return this.fxVolume; },
        set: function (value) {
            this.fxVolume = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundMan.prototype, "IsFxOn", {
        get: function () { return this.fxVolume > 0.0; },
        set: function (value) {
            if (!value) {
                this.previousFxVolume = this.fxVolume;
                this.FxVolume = 0;
            }
            else {
                this.FxVolume = this.previousFxVolume;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundMan.prototype, "IsMusicOn", {
        get: function () { return this.musicVolume > 0.0; },
        set: function (value) {
            if (!value) {
                this.previousMusicVolume = this.musicVolume;
                this.MusicVolume = 0;
            }
            else {
                this.MusicVolume = this.previousMusicVolume;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundMan.prototype, "CurrentTrackId", {
        get: function () {
            return this.currentTrack;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundMan.prototype, "fxDemo", {
        get: function () {
            return this.fxDemoSnd;
        },
        enumerable: true,
        configurable: true
    });
    SoundMan.prototype.jumpAttack = function () {
        this.walkSnd.pause();
        this.jumpAtk.loop(false);
        this.jumpAtk.play();
        this.jumpAtk.volume(this.fxVolume);
    };
    SoundMan.prototype.jump = function () {
        this.walkSnd.pause();
        this.jumpSnd1.play();
        this.jumpSnd1.volume(this.fxVolume);
    };
    SoundMan.prototype.idle = function () {
        this.walkSnd.pause();
    };
    SoundMan.prototype.walk = function (isRunning) {
        this.walkSnd.rate(isRunning ? 2.0 : 1.2);
        if (!this.walkSnd.playing()) {
            this.walkSnd.volume(this.fxVolume);
            this.walkSnd.play();
        }
    };
    SoundMan.prototype.atkMagic1 = function () {
        this.atkMag1.volume(this.fxVolume);
        this.atkMag1.play();
    };
    SoundMan.prototype.hitMagic1 = function () {
        this.hitMag1.volume(this.fxVolume);
        this.hitMag1.play();
    };
    SoundMan.prototype.hitPain = function () {
        this.pain.volume(this.fxVolume);
        this.pain.play();
    };
    SoundMan.prototype.mobSquish = function () {
        this.squish.volume(this.fxVolume);
        this.squish.play();
    };
    SoundMan.prototype.bulletHitWall = function () {
        this.woosh.volume(this.fxVolume);
        this.woosh.play();
    };
    SoundMan.prototype.coin = function () {
        this.coinSnd.volume(this.fxVolume);
        this.coinSnd.play();
    };
    SoundMan.prototype.gem = function () {
        this.gemSnd.volume(this.fxVolume);
        this.gemSnd.play();
    };
    SoundMan.prototype.hurt = function () {
        this.hurtSnd.volume(this.fxVolume);
        this.hurtSnd.play();
    };
    SoundMan.prototype.jumpContact = function () {
        this.jmpContact.volume(this.fxVolume);
        this.jmpContact.play();
    };
    SoundMan.prototype.questItem = function () {
        this.questItemSnd.volume(this.fxVolume);
        this.questItemSnd.play();
    };
    SoundMan.prototype.win = function () {
        if (this.backgroundSnd && this.backgroundSnd.playing()) {
            this.backgroundSnd.fade(1, 0, 500);
        }
        this.hurtSnd.stop();
        this.walkSnd.stop();
        this.jumpSnd1.stop();
        this.jumpSnd2.stop();
        this.burnSnd.stop();
        this.winSnd.volume(this.fxVolume);
        this.winSnd.play();
    };
    SoundMan.prototype.burn = function () {
        if (!this.burnSnd.playing()) {
            this.burnSnd.volume(this.fxVolume);
            this.burnSnd.play();
        }
        this.hurt();
    };
    SoundMan.prototype.burnStop = function () {
        var _this = this;
        //this.burnSnd.stop();
        this.burnSnd.fade(1, 0, 200);
        setTimeout(function () { return _this.burnSnd.stop(); }, 200);
    };
    SoundMan.prototype.getTrack = function (name) {
        for (var i = 0, len = this.musicTrackNames.length; i < len; i++) {
            if (this.musicTrackNames[i].indexOf(name) >= 0) {
                return i;
            }
        }
        return -1;
    };
    SoundMan.prototype.stopTrack = function () {
        if (this.backgroundSnd !== undefined) {
            this.backgroundSnd.stop();
        }
    };
    SoundMan.prototype.playTrack = function (trackId) {
        if (this.backgroundSnd === undefined) {
            this.backgroundSnd = this.musicTracks[trackId];
            console.log("playTrack " + trackId, this.backgroundSnd);
        }
        if (this.backgroundSnd !== this.musicTracks[trackId]) {
            this.backgroundSnd.stop();
            this.backgroundSnd = this.musicTracks[trackId];
            this.backgroundSnd.volume(this.musicVolume);
            this.backgroundSnd.play();
        }
        else {
            if (!this.backgroundSnd.playing()) {
                this.backgroundSnd.volume(this.musicVolume);
                this.backgroundSnd.play();
            }
        }
        this.currentTrack = trackId;
    };
    return SoundMan;
}());
exports.SoundMan = SoundMan;
exports.snd = new SoundMan();


/***/ }),

/***/ "./world/WorldP2.ts":
/*!**************************!*\
  !*** ./world/WorldP2.ts ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var p2 = __webpack_require__(/*! p2 */ "./node_modules/p2/src/p2.js");
var __1 = __webpack_require__(/*! .. */ "./index.ts");
var Dictionary_1 = __webpack_require__(/*! ../_engine/Dictionary */ "./_engine/Dictionary.ts");
var CollisionGroups_1 = __webpack_require__(/*! ./CollisionGroups */ "./world/CollisionGroups.ts");
/**
 * Tuple of two physics bodies touching or penetrating each other.
 */
var ContactPair = /** @class */ (function () {
    function ContactPair(BodyA, BodyB) {
        this.BodyA = BodyA;
        this.BodyB = BodyB;
    }
    return ContactPair;
}());
exports.ContactPair = ContactPair;
/**
 * Takes care of the physics simulations.
 */
var WorldP2 = /** @class */ (function () {
    function WorldP2() {
        var _this = this;
        this.contactPairs = [];
        this.contactWatch = [];
        /**
         * We hold all player contacts separate (due to heavy usage).
         */
        this.playerBodyContacts = [];
        this.fixedTimeStep = 1 / 60; // seconds
        this.beginContact = function (evt) {
            var bullet = null;
            var other = null;
            if (evt.bodyA.shapes[0].collisionGroup === CollisionGroups_1.COL_GRP_BULLET) {
                bullet = evt.bodyA;
                other = evt.bodyB;
            }
            else if (evt.bodyB.shapes[0].collisionGroup === CollisionGroups_1.COL_GRP_BULLET) {
                bullet = evt.bodyB;
                other = evt.bodyA;
            }
            if (bullet) {
                // console.log("emitting bulettContact, body.id: " + bullet.id);
                _this.world.emit({ type: "bulletContact", playerHit: other === _this.playerBody, bulletBody: bullet, otherBody: other });
                return;
            }
            //  check for player contacts (but only with dynamic bodies)
            if (_this.playerBody === evt.bodyA) {
                _this.playerBodyContacts.push(evt.bodyB);
                _this.world.emit({ type: "playerContact", velocity: _this.playerBody.velocity, body: evt.bodyB });
                return;
            }
            else if (_this.playerBody === evt.bodyB) {
                _this.playerBodyContacts.push(evt.bodyA);
                _this.world.emit({ type: "playerContact", velocity: _this.playerBody.velocity, body: evt.bodyA });
                return;
            }
            //  check for watched bodies and store pairs if match
            var watchedItemFound = _this.contactWatch.filter(function (bodyId) {
                return (bodyId === evt.bodyA.id || bodyId === evt.bodyB.id);
            });
            if (watchedItemFound && watchedItemFound.length > 0) {
                var cp = new ContactPair(evt.bodyA, evt.bodyB);
                _this.contactPairs.push(cp);
            }
        };
        this.endContact = function (evt) {
            //  no need to update player contacts or contact pairs for bullets
            var isBulletConntact = evt.bodyA.shapes[0].collisionGroup === CollisionGroups_1.COL_GRP_BULLET || evt.bodyB.shapes[0].collisionGroup === CollisionGroups_1.COL_GRP_BULLET;
            if (isBulletConntact)
                return;
            //  if it is a player contact remove the foreign body from the playerBodyContacts list
            if (_this.playerBody === evt.bodyA) {
                var bodyIDX = _this.playerBodyContacts.indexOf(evt.bodyB);
                _this.playerBodyContacts.splice(bodyIDX, 1);
                _this.world.emit({ type: "playerContactEnd", velocity: _this.playerBody.velocity, body: evt.bodyB });
                //console.log("endContact",evt.bodyB);
                return;
            }
            else if (_this.playerBody === evt.bodyB) {
                var bodyIDX = _this.playerBodyContacts.indexOf(evt.bodyB);
                _this.playerBodyContacts.splice(bodyIDX, 1);
                _this.world.emit({ type: "playerContactEnd", velocity: _this.playerBody.velocity, body: evt.bodyA });
                //console.log("endContact", evt.bodyA);
                return;
            }
            //console.log("endContact: ", evt);
            var foundIdx = -1;
            for (var i = 0; i < _this.contactPairs.length; i++) {
                var cp = _this.contactPairs[i];
                if ((cp.BodyA === evt.bodyA && cp.BodyB === evt.bodyB) ||
                    (cp.BodyA === evt.bodyB && cp.BodyB === evt.bodyA)) {
                    foundIdx = i;
                    break;
                }
            }
            if (foundIdx >= 0) {
                _this.contactPairs.splice(foundIdx, 1);
            }
        };
        this.world = new p2.World({
            gravity: [0, -1550],
        });
        this.setupMaterials();
        //------------------------------------------
        // create an infinite ground plane body
        //------------------------------------------
        this.ground = new p2.Body({
            mass: 0,
        });
        var shape = new p2.Plane();
        shape.material = this.materials.get("ground_default");
        shape.collisionGroup = CollisionGroups_1.COL_GRP_GROUND;
        shape.collisionMask = CollisionGroups_1.COL_GRP_SCENE | CollisionGroups_1.COL_GRP_NPC | CollisionGroups_1.COL_GRP_PLAYER | CollisionGroups_1.COL_GRP_BULLET;
        this.ground.addShape(shape);
        this.world.addBody(this.ground);
        //------------------------------------------
        //  player body
        //------------------------------------------
        this.playerBody = new p2.Body({
            mass: 42,
            fixedRotation: true,
        });
        this.playerBody.damping = 0.001;
        shape = new p2.Circle({
            radius: 24,
        });
        shape.collisionGroup = CollisionGroups_1.COL_GRP_PLAYER;
        shape.collisionMask = CollisionGroups_1.COL_GRP_GROUND | CollisionGroups_1.COL_GRP_SCENE | CollisionGroups_1.COL_GRP_NPC | CollisionGroups_1.COL_GRP_BULLET;
        shape.material = this.materials.get("player");
        this.playerBody.addShape(shape);
        this.world.addBody(this.playerBody);
        //------------------------------------------
        //  settings
        //------------------------------------------
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        this.world.on("beginContact", this.beginContact, this);
        this.world.on("endContact", this.endContact, this);
    }
    /**
     * Removes all bodies except the player body and ground plane.
     */
    WorldP2.prototype.clearLevel = function () {
        var bodies = this.world.bodies;
        for (var i = bodies.length - 1; i >= 0; i--) {
            var b = bodies[i];
            if (b !== this.playerBody && b !== this.ground) {
                this.world.removeBody(b);
            }
        }
    };
    Object.defineProperty(WorldP2.prototype, "bodies", {
        /**
         * Returns the world bodies.
         */
        get: function () {
            return this.world.bodies;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds an event handler to the p2 world object.
     * @param eventName
     * @param handler
     */
    WorldP2.prototype.on = function (eventName, handler, context) {
        context = context || this;
        this.world.on(eventName, handler, context);
    };
    /**
     * advances the physics simulation for the given dt time
     * @param dt the time in seconds since the last simulation step
     */
    WorldP2.prototype.update = function (dt) {
        this.world.step(this.fixedTimeStep, dt / 1000);
        __1.Global.position.x = this.playerBody.interpolatedPosition[0];
        __1.Global.position.y = this.playerBody.interpolatedPosition[1];
    };
    /**
     * Removes the body from world.
     * @param body
     */
    WorldP2.prototype.removeBody = function (body) {
        this.world.removeBody(body);
    };
    /**
     * adds an object to the p2 world
     * @param body
     */
    WorldP2.prototype.addBody = function (body) {
        // HACK: loader specific implementation stores the material name in shape.materialName
        if (body.shapes && body.shapes.length > 0) {
            for (var i = 0, len = body.shapes.length; i < len; i++) {
                var shape = body.shapes[i];
                if (shape.materialName && !shape.material) {
                    shape.material = this.materials.get(shape.materialName);
                }
            }
        }
        this.world.addBody(body);
    };
    /**
     * Clears all saved contacts (from contactPairs) for the given body.
     * @param body
     */
    WorldP2.prototype.clearContactsForBody = function (body) {
        if (body === this.playerBody) {
            this.playerBodyContacts = [];
            return;
        }
        var foundIdx = 0;
        while (foundIdx > -1) {
            foundIdx = -1;
            for (var i = 0; i < this.contactPairs.length; i++) {
                var cp = this.contactPairs[i];
                if (cp.BodyA === body || cp.BodyB === body) {
                    foundIdx = i;
                    break;
                }
            }
            if (foundIdx >= 0) {
                this.contactPairs.splice(foundIdx, 1);
            }
        }
    };
    /**
     * returns all contact pairs for the given body.
     * Note: the body must be in the contact watch list or an empty array will be returned.
     * @param body
     */
    WorldP2.prototype.getContactsForBody = function (body) {
        var foundPairs = [];
        for (var i = 0, len = this.contactPairs.length; i < len; i++) {
            var cp = this.contactPairs[i];
            if (cp.BodyA === body || cp.BodyB === body) {
                foundPairs.push(cp);
            }
        }
        ;
        return foundPairs;
    };
    /**
     * Adds the body to the contact watch list.
     * Only bodies in this list can be retrieved via the getContactsForBody() function.
     * @param body
     */
    WorldP2.prototype.addContactWatch = function (body) {
        this.contactWatch.push(body.id);
    };
    Object.defineProperty(WorldP2.prototype, "playerContacts", {
        /**
         * Returns all bodies the player has contact with.
         */
        get: function () {
            return this.playerBodyContacts;
        },
        enumerable: true,
        configurable: true
    });
    WorldP2.prototype.setupMaterials = function () {
        this.materials = new Dictionary_1.Dictionary();
        this.materials.set("player", new p2.Material(p2.Material.idCounter++));
        this.materials.set("ground_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("box_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("box_highfriction", new p2.Material(p2.Material.idCounter++));
        this.materials.set("mob_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("bumper", new p2.Material(p2.Material.idCounter++));
        var playerGroundContactMaterial = new p2.ContactMaterial(this.materials.get("player"), this.materials.get("ground_default"), {
            friction: 0.85,
            restitution: 0.1,
            stiffness: p2.Equation.DEFAULT_STIFFNESS,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(playerGroundContactMaterial);
        var playerMobContactMaterial = new p2.ContactMaterial(this.materials.get("player"), this.materials.get("mob_default"), {
            friction: 0.2,
            restitution: 0.4,
            stiffness: p2.Equation.DEFAULT_STIFFNESS,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(playerMobContactMaterial);
        var playerBoxContactMaterial = new p2.ContactMaterial(this.materials.get("player"), this.materials.get("box_default"), {
            friction: 0.50,
            restitution: 0.25,
            stiffness: p2.Equation.DEFAULT_STIFFNESS,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(playerBoxContactMaterial);
        var playerBoxHighFirctContactMaterial = new p2.ContactMaterial(this.materials.get("player"), this.materials.get("box_highfriction"), {
            friction: 0.70,
            restitution: 0.20,
            stiffness: p2.Equation.DEFAULT_STIFFNESS,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(playerBoxHighFirctContactMaterial);
        var playerBumperContactMaterial = new p2.ContactMaterial(this.materials.get("player"), this.materials.get("bumper"), {
            friction: 0.35,
            restitution: 0.85,
            stiffness: Number.MAX_VALUE,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: Number.MAX_VALUE,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(playerBumperContactMaterial);
        var boxGroundContactMaterial = new p2.ContactMaterial(this.materials.get("box_default"), this.materials.get("ground_default"), {
            friction: 0.8,
            restitution: 0.3,
            stiffness: p2.Equation.DEFAULT_STIFFNESS,
            relaxation: p2.Equation.DEFAULT_RELAXATION,
            frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
            frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
            surfaceVelocity: 0
        });
        this.world.addContactMaterial(boxGroundContactMaterial);
    };
    return WorldP2;
}());
exports.WorldP2 = WorldP2;
exports.wp2 = new WorldP2();


/***/ })

},[["./app.ts","runtime","vendors~common~main","vendors~main"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9fZW5naW5lL0FuaW1hdGVkU3ByaXRlLnRzIiwid2VicGFjazovLy8uL19lbmdpbmUvQnV0dG9uLnRzIiwid2VicGFjazovLy8uL19lbmdpbmUvRGljdGlvbmFyeS50cyIsIndlYnBhY2s6Ly8vLi9fZW5naW5lL0tleWJvYXJkTWFwcGVyLnRzIiwid2VicGFjazovLy8uL19lbmdpbmUvTGlua2VkTGlzdC50cyIsIndlYnBhY2s6Ly8vLi9fZW5naW5lL1BhcmFsbGF4LnRzIiwid2VicGFjazovLy8uL19lbmdpbmUvU2NlbmUudHMiLCJ3ZWJwYWNrOi8vLy4vX2VuZ2luZS9TY2VuZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vLy4vX2VuZ2luZS9TbGlkZXIudHMiLCJ3ZWJwYWNrOi8vLy4vX2VuZ2luZS9UZXh0dXJlTG9hZGVyLnRzIiwid2VicGFjazovLy8uL19lbmdpbmUvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwLnRzIiwid2VicGFjazovLy8uL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly8vLi9lbnVtcy50cyIsIndlYnBhY2s6Ly8vLi9ldmVudHMudHMiLCJ3ZWJwYWNrOi8vLy4vZ2xvYmFsLnRzIiwid2VicGFjazovLy8uL2luZGV4LnRzIiwid2VicGFjazovLy8uL21vYnMvQUkudHMiLCJ3ZWJwYWNrOi8vLy4vbW9icy9CYXNpY1N0YXRpY0FJLnRzIiwid2VicGFjazovLy8uL21vYnMvTW9iLnRzIiwid2VicGFjazovLy8uL21vYnMvU3Bhd25Qb2ludC50cyIsIndlYnBhY2s6Ly8vLi9vYmplY3RzL0J1bGxldC50cyIsIndlYnBhY2s6Ly8vLi9vYmplY3RzL0J1bXBlci50cyIsIndlYnBhY2s6Ly8vLi9vYmplY3RzL0hlcm9DaGFyYWN0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vb2JqZWN0cy9MYXZhLnRzIiwid2VicGFjazovLy8uL29iamVjdHMvTWFzdGVySHVkLnRzIiwid2VicGFjazovLy8uL29iamVjdHMvTW92ZW1lbnRDb250cm9sbGVyLnRzIiwid2VicGFjazovLy8uL29iamVjdHMvUGxhdGZvcm0udHMiLCJ3ZWJwYWNrOi8vLy4vb2JqZWN0cy9QbGF5ZXJTdGF0cy50cyIsIndlYnBhY2s6Ly8vLi9vYmplY3RzL1N0YXRzSHVkLnRzIiwid2VicGFjazovLy8uL3F1ZXN0U3lzdGVtL1F1ZXN0TWFuYWdlci50cyIsIndlYnBhY2s6Ly8vLi9xdWVzdFN5c3RlbS9RdWVzdFN0YXRlLnRzIiwid2VicGFjazovLy8uL3NjZW5lcy9Cb290U2NlbmUudHMiLCJ3ZWJwYWNrOi8vLy4vc2NlbmVzL0N1dFNjZW5lLnRzIiwid2VicGFjazovLy8uL3NjZW5lcy9Mb2FkZXJTY2VuZS50cyIsIndlYnBhY2s6Ly8vLi9zY2VuZXMvTWFpblNjZW5lLnRzIiwid2VicGFjazovLy8uL3NjZW5lcy9PcHRpb25zU2NlbmUudHMiLCJ3ZWJwYWNrOi8vLy4vd29ybGQvQ29sbGlzaW9uR3JvdXBzLnRzIiwid2VicGFjazovLy8uL3dvcmxkL0xldmVsSGVscGVyLnRzIiwid2VicGFjazovLy8uL3dvcmxkL0xldmVsTG9hZGVyLnRzIiwid2VicGFjazovLy8uL3dvcmxkL1NvdW5kTWFuLnRzIiwid2VicGFjazovLy8uL3dvcmxkL1dvcmxkUDIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRkFBMEM7QUFDMUMscUZBQWdDO0FBQ2hDLCtGQUFnRDtBQUVoRDtJQUFvQywwQ0FBVztJQUMzQztRQUFBLFlBQ0ksaUJBQU8sU0FJVjtRQUVPLGdCQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFxQixDQUFDO1FBQy9DLHFCQUFlLEdBQTZCLElBQUksQ0FBQztRQW9CM0Q7O1dBRUc7UUFDSSxVQUFJLEdBQUcsVUFBQyxJQUFZLEVBQUUsR0FBWSxFQUFFLElBQVc7WUFBWCxrQ0FBVztZQUNsRCxJQUFJLENBQUMsS0FBSSxDQUFDLGVBQWUsSUFBSSxLQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7Z0JBQ3JF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QzFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxTQUFTO1lBQ25DLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCO1lBQ2xELGVBQWUsRUFBRSxDQUFDO1NBQ3JCLENBQUMsQ0FBQztRQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUUzRCxJQUFJLHdCQUF3QixHQUFHLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FDakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQ3BDO1lBQ0ksUUFBUSxFQUFFLEdBQUc7WUFDYixXQUFXLEVBQUUsR0FBRztZQUNoQixTQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUI7WUFDeEMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCO1lBQzFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCO1lBQ2hELGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCO1lBQ2xELGVBQWUsRUFBRSxDQUFDO1NBQ3JCLENBQUMsQ0FBQztRQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0wsY0FBQztBQUFELENBQUM7QUF0V1ksMEJBQU87QUF3V1QsV0FBRyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUMiLCJmaWxlIjoiLi9tYWluLmY4ZjVjMTA3NzYzYzQxNDg1NjYxLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGljdGlvbmFyeSB9IGZyb20gXCIuL0RpY3Rpb25hcnlcIjtcclxuaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJztcclxuaW1wb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4vVGV4dHVyZUxvYWRlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgQW5pbWF0ZWRTcHJpdGUgZXh0ZW5kcyBQSVhJLlNwcml0ZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGl2b3Quc2V0KDAuNSk7XHJcbiAgICAgICAgdGhpcy5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoMSwgLTEpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIGFuaW1hdGlvbnMgPSBuZXcgRGljdGlvbmFyeTxBbmltYXRpb25TZXF1ZW5jZT4oKTtcclxuICAgIHByb3RlY3RlZCBjdXJyZW50U2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGFkZEFuaW1hdGlvbnMoLi4uc2VxdWVuY2VzOiBBcnJheTxBbmltYXRpb25TZXF1ZW5jZT4pOnZvaWQge1xyXG4gICAgICAgIHNlcXVlbmNlcy5mb3JFYWNoKChzZXE6IEFuaW1hdGlvblNlcXVlbmNlLCBpZHg6bnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5zZXQoc2VxLnNlcXVlbmNlTmFtZSwgc2VxKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBpZiBubyBjbGlwIGV4aXN0cyBjcmVhdGUgaXQgZnJvbSBmaXJzdCBhbmltYXRpb24gc2VxdWVuY2VcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRleHR1cmUudmFsaWQgJiYgaWR4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHR1cmUgPSBzZXEuc3ByaXRlU2hlZXQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHR1cmUuZnJhbWUgPSBzZXEuZnJhbWVzWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsZWFyQW5pbWF0aW9ucygpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTZXF1ZW5jZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgUGxheXMgdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSBieSBuYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwbGF5ID0gKG5hbWU6IHN0cmluZywgZnBzPzogbnVtYmVyLCBsb29wID0gdHJ1ZSkgOnZvaWQgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2VxdWVuY2UgfHwgdGhpcy5jdXJyZW50U2VxdWVuY2Uuc2VxdWVuY2VOYW1lICE9PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRBbmltYXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VxdWVuY2UgPSB0aGlzLmFuaW1hdGlvbnMuZ2V0KG5hbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLmN1cnJlbnRTZXF1ZW5jZS5zcHJpdGVTaGVldDtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLmZyYW1lID0gdGhpcy5jdXJyZW50U2VxdWVuY2UuZnJhbWVzWzBdOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZnBzID0gZnBzIHx8IHRoaXMuZnBzO1xyXG4gICAgICAgIHRoaXMuaXNMb29waW5nID0gbG9vcDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFjY3VtdWxhdG9yOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBpc1BsYXlpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgaXNMb29waW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGZyYW1lSW5kZXg6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGcHM6IG51bWJlciA9IDg7XHJcbiAgICBwcml2YXRlIG9uQ29tcGxldGVDYWxsQmFjayE6IChzZXE6QW5pbWF0aW9uU2VxdWVuY2UpID0+IHZvaWQ7XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlIChkdDogbnVtYmVyKSB7IFxyXG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZyAmJiB0aGlzLnRleHR1cmUudmFsaWQgJiYgdGhpcy5jdXJyZW50U2VxdWVuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5hY2N1bXVsYXRvciArPSBkdDtcclxuICAgICAgICAgICAgbGV0IHNlY0ZvckZyYW1lID0gMTAwMCAvIHRoaXMuZnBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hY2N1bXVsYXRvciA+IHNlY0ZvckZyYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjY3VtdWxhdG9yIC09IHNlY0ZvckZyYW1lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0dXJlLmZyYW1lID0gdGhpcy5jdXJyZW50U2VxdWVuY2UuZnJhbWVzWysrdGhpcy5mcmFtZUluZGV4XTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lSW5kZXggPT0gdGhpcy5jdXJyZW50U2VxdWVuY2UuZnJhbWVzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gIGVuZCB0aGUgYW5pbWF0aW9uIGlmIG5vdCBsb29waW5nXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzTG9vcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNvbXBsZXRlQ2FsbEJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZUNhbGxCYWNrKHRoaXMuY3VycmVudFNlcXVlbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBvbkNvbXBsZXRlKGNiOiAoc2VxOiBBbmltYXRpb25TZXF1ZW5jZSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMub25Db21wbGV0ZUNhbGxCYWNrID0gY2I7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IG9uQ29tcGxldGUoKTogKHNlcTogQW5pbWF0aW9uU2VxdWVuY2UpID0+IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9uQ29tcGxldGVDYWxsQmFjaztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcCgpOnZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGZwcygpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEZwcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgZnBzKGZwczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnBzID0gZnBzO1xyXG4gICAgICAgIGlmIChmcHMgPCAyKSBkZWJ1Z2dlcjtcclxuICAgIH0gICAgXHJcbiAgICBwdWJsaWMgc2V0IGxvb3AoaXNMb29waW5nOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5pc0xvb3BpbmcgPSBpc0xvb3Bpbmc7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IGxvb3AoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNMb29waW5nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgcmVzZXRBbmltYXRpb24oKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTZXF1ZW5jZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hY2N1bXVsYXRvciA9IDA7XHJcbiAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gLTE7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuLypcclxuICogICBDcmVhdGVzIHRleHR1cmVzIGZvciBhbGwgaW5kaXZpZHVhbCBmcmFtZXMgb2YgdGhlIHNlcXVlbmNlIGZyb20gdGhlIGdpdmVuIHRleHR1cmUgYXRsYXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uU2VxdWVuY2UgIHtcclxuICAgIHB1YmxpYyBzcHJpdGVTaGVldDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIGZyYW1lczogUElYSS5SZWN0YW5nbGVbXSA9IFtdO1xyXG4gICAgcHVibGljIGlzQXRsYXMgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIHNlcXVlbmNlTmFtZTogc3RyaW5nLCBzcHJpdGVTaGVldE5hbWU6c3RyaW5nLCBmcmFtZXM6IEFycmF5PG51bWJlcj4gPSBbXSwgZnJhbWVXaWR0aCA6IG51bWJlciwgZnJhbWVIZWlnaHQgOiBudW1iZXIpIHtcclxuICAgICAgICAvL2xldCB0ZW1wVGV4dXJlIDogUElYSS5UZXh0dXJlID0gUElYSS51dGlscy5UZXh0dXJlQ2FjaGVbc3ByaXRlU2hlZXROYW1lXTtcclxuICAgICAgICBsZXQgdGVtcFRleHVyZSA9IFRleHR1cmVMb2FkZXIuR2V0KHNwcml0ZVNoZWV0TmFtZSk7XHJcbiAgICAgICAgdGhpcy5pc0F0bGFzID0gdGVtcFRleHVyZS5mcmFtZS53aWR0aCAhPSB0ZW1wVGV4dXJlLmJhc2VUZXh0dXJlLndpZHRoIHx8IHRlbXBUZXh1cmUuZnJhbWUuaGVpZ2h0ICE9IHRlbXBUZXh1cmUuYmFzZVRleHR1cmUuaGVpZ2h0O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlU2hlZXQgPSBuZXcgUElYSS5UZXh0dXJlKHRlbXBUZXh1cmUuYmFzZVRleHR1cmUpO1xyXG4gICAgICAgIHZhciB4RnJhbWVzID0gdGhpcy5pc0F0bGFzID8gTWF0aC5mbG9vcih0ZW1wVGV4dXJlLmZyYW1lLndpZHRoIC8gZnJhbWVXaWR0aCkgOiBNYXRoLmZsb29yKHRoaXMuc3ByaXRlU2hlZXQud2lkdGggLyBmcmFtZVdpZHRoKTtcclxuICAgICAgICBcclxuICAgICAgICBmcmFtZXMuZm9yRWFjaCgoZnJhbWU6bnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihmcmFtZSAvIHhGcmFtZXMpO1xyXG4gICAgICAgICAgICBsZXQgeCA9IGZyYW1lICUgeEZyYW1lcztcclxuICAgICAgICAgICAgbGV0IHJlY3QgOiBQSVhJLlJlY3RhbmdsZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNBdGxhcyl7XHJcbiAgICAgICAgICAgICAgICByZWN0ID0gbmV3IFBJWEkuUmVjdGFuZ2xlKHRlbXBUZXh1cmUuZnJhbWUueCArICB4ICogZnJhbWVXaWR0aCwgdGVtcFRleHVyZS5mcmFtZS55ICsgeSAqIGZyYW1lSGVpZ2h0LCBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICByZWN0ID0gbmV3IFBJWEkuUmVjdGFuZ2xlKHggKiBmcmFtZVdpZHRoLCB5ICogZnJhbWVIZWlnaHQsIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKHJlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0IGZyYW1lQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJztcclxuaW1wb3J0IHsgT3V0bGluZUZpbHRlciB9IGZyb20gJ0BwaXhpL2ZpbHRlci1vdXRsaW5lJztcclxuaW1wb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4nO1xyXG5cclxuZXhwb3J0IGVudW0gT3V0bGluZU1vZGUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb3V0bGluZSBpcyBiYWNrZWQgaW4gdGhlIGJ1dHRvbnMgdGV4dHVyZS5cclxuICAgICAqIFRoaXMgbG9va3MgZXhjZWxlbnQgaWYgdGhlIGJ1dHRvbidzIHNpemUgbWF0Y2hlcyB0aGUgdGV4dHVyZS4gIFxyXG4gICAgICogKi9cclxuICAgIFRleHR1cmUsXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBvdXRsaW5lIGlzIGNyZWF0ZWQgd2l0aCB0aGUgT3V0bGluZUZpbHRlci5cclxuICAgICAqIEJlc3QgdG8gYmUgdXNlZCB3aXRoIHNtYWxsIHVuaWZvcm0gdGV4dHVyZXMgKHNvIHNjYWxpbmcgd2lsbCBub3QgYWZmZWN0IHRoZSB0ZXh0dXJlKS4gXHJcbiAgICAgKi9cclxuICAgIEZpbHRlclxyXG59XHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBQSVhJLlNwcml0ZSB7XHJcblxyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlVXA6IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgdGV4dHVyZUhpZ2hsaWdodCE6IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgdGV4dHVyZURvd246IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgX291dGxpbmVNb2RlOiBPdXRsaW5lTW9kZSA9IE91dGxpbmVNb2RlLkZpbHRlcjtcclxuICAgIHByaXZhdGUgX291dGxpbmVDb2xvcjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBfaXNIaWdobGlnaHRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfaXNQcmVzc2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9pc0Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9pc0NsaWNrU3RhcnRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfdGV4dDogUElYSS5UZXh0O1xyXG4gICAgcHJpdmF0ZSByZXF1ZXN0ZWRXaWR0aDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgcmVxdWVzdGVkSGVpZ2h0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmVQYXRoOiBzdHJpbmcsIHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHdpZHRoOiBudW1iZXIgPSAxMjgsIGhlaWdodDogbnVtYmVyID0gMzIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KHggfHwgMCwgeSB8fCAwKTtcclxuICAgICAgICB0aGlzLnJlcXVlc3RlZEhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLnJlcXVlc3RlZFdpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgICAgIC8vICBzZXR1cCBidXR0b24gdGV4dHVyZXNcclxuICAgICAgICB0aGlzLnNldFRleHR1cmUodGV4dHVyZVBhdGgpO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbk1vZGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnNvciA9IFwiaG92ZXJcIjtcclxuXHJcbiAgICAgICAgLy8gc2V0IHRoZSBtb3VzZWRvd24gYW5kIHRvdWNoc3RhcnQgY2FsbGJhY2suLi5cclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyZG93bicsIHRoaXMub25CdXR0b25Eb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMub25CdXR0b25VcClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXBvdXRzaWRlJywgdGhpcy5vbkJ1dHRvblVwT3V0c2lkZSlcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyb3ZlcicsIHRoaXMub25CdXR0b25PdmVyKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJvdXQnLCB0aGlzLm9uQnV0dG9uT3V0KVxyXG5cclxuICAgICAgICB0aGlzLmlzUHJlc3NlZCA9IGZhbHNlOyAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG91dGxpbmVNb2RlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX291dGxpbmVNb2RlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBvdXRsaW5lTW9kZShzdGF0ZTogT3V0bGluZU1vZGUpIHtcclxuICAgICAgICB0aGlzLl9vdXRsaW5lTW9kZSA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9IHRoaXMuX291dGxpbmVNb2RlID09IE91dGxpbmVNb2RlLkZpbHRlciA/IFtuZXcgT3V0bGluZUZpbHRlcigxLCB0aGlzLl9vdXRsaW5lQ29sb3IsIDAuNSldICA6IG51bGw7ICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBvdXRsaW5lQ29sb3IoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3V0bGluZUNvbG9yO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBvdXRsaW5lQ29sb3IodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX291dGxpbmVDb2xvciA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuZmlsdGVycyA9IHRoaXMuX291dGxpbmVNb2RlID09IE91dGxpbmVNb2RlLkZpbHRlciA/IFtuZXcgT3V0bGluZUZpbHRlcigxLCB0aGlzLl9vdXRsaW5lQ29sb3IsIDAuNSldICA6IG51bGw7ICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBkaXNhYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNEaXNhYmxlZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgZGlzYWJsZWQoc3RhdGU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9pc0Rpc2FibGVkID0gc3RhdGU7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSBzdGF0ZSA/IFwiXCIgOiBcImhvdmVyXCI7XHJcbiAgICAgICAgdGhpcy5hcHBseVRleHR1cmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzUHJlc3NlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNQcmVzc2VkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBpc1ByZXNzZWQoc3RhdGU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9pc1ByZXNzZWQgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNIaWdobGlnaHRlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNIaWdobGlnaHRlZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgaXNIaWdobGlnaHRlZChzdGF0ZTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2lzSGlnaGxpZ2h0ZWQgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdGV4dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgdGV4dCh0ZXh0OiBQSVhJLlRleHQpIHtcclxuICAgICAgICBpZiAodGhpcy5fdGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMuX3RleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90ZXh0ID0gdGV4dDtcclxuICAgICAgICBpZiAodGhpcy5fdGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXh0LmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgeCA9ICh0aGlzLndpZHRoIC8gdGhpcy5zY2FsZS54KSAvIDI7XHJcbiAgICAgICAgICAgIHZhciB5ID0gKHRoaXMuaGVpZ2h0IC8gdGhpcy5zY2FsZS55KSAvIDI7XHJcbiAgICAgICAgICAgIHRoaXMuX3RleHQucG9zaXRpb24uc2V0KHgsIHkpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuX3RleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DbGljayE6IChldmVudDphbnkpID0+IHZvaWQ7XHJcbiAgICBwdWJsaWMgbW91c2VvdmVyITooZXZlbnQ6YW55KSA9PiB2b2lkO1xyXG4gICAgcHVibGljIG1vdXNlb3V0ITooZXZlbnQ6YW55KSA9PiB2b2lkO1xyXG5cclxuICAgIHByaXZhdGUgb25DbGlja0hhbmRsZXIoZXZlbnQ6YW55KXtcclxuICAgICAgICBpZighdGhpcy5vbkNsaWNrKXtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwib25DbGljaygpIGVtcHR5LCBkaWQgeW91IGZvcmdldCB0byBhdHRhY2ggYSBoYW5kbGVyP1wiKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xpY2soZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvbkJ1dHRvbkRvd24gPSAoKSA9PiB7XHJcbiAgICAgICAgaWYodGhpcy5faXNEaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2lzQ2xpY2tTdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLnRleHR1cmVEb3duO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25CdXR0b25VcCA9IChldmVudDphbnkpID0+IHtcclxuICAgICAgICBpZih0aGlzLl9pc0Rpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzQ2xpY2tTdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzQ2xpY2tTdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMub25DbGlja0hhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25CdXR0b25VcE91dHNpZGUgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYodGhpcy5faXNEaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUZXh0dXJlKCk7XHJcbiAgICAgICAgdGhpcy5faXNDbGlja1N0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQnV0dG9uT3ZlciA9IChldmVudDphbnkpID0+IHtcclxuICAgICAgICBpZih0aGlzLl9pc0Rpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy50ZXh0dXJlSGlnaGxpZ2h0O1xyXG4gICAgICAgIGlmKHRoaXMubW91c2VvdmVyKXRoaXMubW91c2VvdmVyKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQnV0dG9uT3V0ID0gKGV2ZW50OmFueSkgPT4ge1xyXG4gICAgICAgIGlmKHRoaXMuX2lzRGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLl9pc0NsaWNrU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUZXh0dXJlKCk7XHJcbiAgICAgICAgaWYodGhpcy5tb3VzZW91dCl0aGlzLm1vdXNlb3V0KGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5VGV4dHVyZSgpIHtcclxuICAgICAgICBpZih0aGlzLl9pc0Rpc2FibGVkKXtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy50ZXh0dXJlVXA7XHJcbiAgICAgICAgICAgIHRoaXMudGludCA9IDB4NjA2MDYwO1xyXG4gICAgICAgIH1lbHNlIGlmKHRoaXMuX2lzSGlnaGxpZ2h0ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLnRleHR1cmVIaWdobGlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGludCA9IDB4NjY2NjY2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLl9pc1ByZXNzZWQgPyB0aGlzLnRleHR1cmVEb3duIDogdGhpcy50ZXh0dXJlVXA7XHJcbiAgICAgICAgICAgIHRoaXMudGludCA9IDB4ZmZmZmZmO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGVyZm9ybUNsaWNrKGV2ZW50OmFueSl7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrSGFuZGxlcihldmVudCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRUZXh0dXJlKHRleHR1cmVBdGxhc05hbWU6IHN0cmluZykge1xyXG4gICAgICAgIC8vdmFyIGF0bGFzVGV4dHVyZSA9IFBJWEkubG9hZGVyLnJlc291cmNlc1t0ZXh0dXJlQXRsYXNOYW1lXS50ZXh0dXJlO1xyXG4gICAgICAgIHZhciBhdGxhc1RleHR1cmUgPSBUZXh0dXJlTG9hZGVyLkdldCh0ZXh0dXJlQXRsYXNOYW1lKTtcclxuICAgICAgICBhdGxhc1RleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5TQ0FMRV9NT0RFUy5ORUFSRVNUO1xyXG4gICAgICAgIHZhciBidG5IZWlnaHQgPSBhdGxhc1RleHR1cmUuaGVpZ2h0IC8gMztcclxuICAgICAgICB2YXIgYnRuV2lkdGggPSBhdGxhc1RleHR1cmUud2lkdGg7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlVXAgPSBuZXcgUElYSS5UZXh0dXJlKGF0bGFzVGV4dHVyZS5iYXNlVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAgKiBidG5IZWlnaHQsIGJ0bldpZHRoLCBidG5IZWlnaHQpKTtcclxuICAgICAgICB0aGlzLnRleHR1cmVIaWdobGlnaHQgPSBuZXcgUElYSS5UZXh0dXJlKGF0bGFzVGV4dHVyZS5iYXNlVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDEgKiBidG5IZWlnaHQsIGJ0bldpZHRoLCBidG5IZWlnaHQpKTtcclxuICAgICAgICB0aGlzLnRleHR1cmVEb3duID0gbmV3IFBJWEkuVGV4dHVyZShhdGxhc1RleHR1cmUuYmFzZVRleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAyICogYnRuSGVpZ2h0LCBidG5XaWR0aCwgYnRuSGVpZ2h0KSk7XHJcblxyXG4gICAgICAgIC8vICBjYWxjIHRoZSBzY2FsZSBiYXNlZCBvbiBkZXNpcmVkIGhlaWdodC93aWR0aFxyXG4gICAgICAgIHZhciBzY2FsZVcgPSAodGhpcy5yZXF1ZXN0ZWRXaWR0aCB8fCBidG5XaWR0aCApIC8gYnRuV2lkdGg7XHJcbiAgICAgICAgdmFyIHNjYWxlSCA9ICh0aGlzLnJlcXVlc3RlZEhlaWdodCB8fCBidG5IZWlnaHQpIC8gYnRuSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlVywgc2NhbGVIKTtcclxuXHJcbiAgICAgICAgdGhpcy5hcHBseVRleHR1cmUoKTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgRGljdGlvbmFyeTxUPiB7XHJcbiAgICBwcml2YXRlIF92YWx1ZXM6IHsgW2tleTogc3RyaW5nXTogVDsgfSA9IHt9O1xyXG4gICAgcHJpdmF0ZSBfa2V5czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlc1trZXldOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbnRhaW5zKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGtleSBpbiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZShrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2tleXMuaW5kZXhPZihrZXksIDApO1xyXG4gICAgICAgIHRoaXMuX2tleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fdmFsdWVzW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldChrZXk6IHN0cmluZywgdmFsdWU6IFQpIHtcclxuICAgICAgICBpZiAoIShrZXkgaW4gdGhpcy5fdmFsdWVzKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlzLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmFsdWVzW2tleV0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGtleXMoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBbGwoKTogeyBba2V5OiBzdHJpbmddOiBUOyB9IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTZXQoa2V5OiBzdHJpbmcsIHZhbHVlR2V0dGVyOiAoKSA9PiBUKTogVDtcclxuICAgIHB1YmxpYyBnZXRTZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBUKTogVDtcclxuICAgIHB1YmxpYyBnZXRTZXQoa2V5OiBzdHJpbmcsIHZhbHVlT3J2YWx1ZUdldHRlcjogYW55KTogVCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGtleSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB0eXBlb2YgdmFsdWVPcnZhbHVlR2V0dGVyID09ICdmdW5jdGlvbicgPyB2YWx1ZU9ydmFsdWVHZXR0ZXIoKSA6IHZhbHVlT3J2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldChrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9rZXlzID0gW107XHJcbiAgICAgICAgdGhpcy5fdmFsdWVzID0ge307XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tIFwiLi9TY2VuZU1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4qICAgU2ltcGxlIGtleWJvYXJkIG1hcHBlci5cclxuKi9cclxuZXhwb3J0IGNsYXNzIEtleWJvYXJkTWFwcGVyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqICAgU3RvcmVzIGtleWJvYXJkIHByZXNzZWQgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUga2V5Ym9hcmQ6IGJvb2xlYW5bXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICAgU3RvcmVzIGFuIGFycmF5IG9mIEtleWJvYXJkQWN0aW9uIGluc3RhbmNlcyBwZXIgR2xvYmFsLlN0YXRlLiBUaGUgJ3N0YXRlJyBpbmRleGVyIGlzIGEgbnVtZXJpYyB2YWx1ZSBmcm9tIHRoZSBHbG9iYWwuU3RhdGUgZW51bS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0ZUFjdGlvbnM6IHsgW3N0YXRlOiBudW1iZXJdOiBLZXlib2FyZEFjdGlvbltdOyB9O1xyXG5cclxuICAgIHByaXZhdGUgQUxUX0tFWTogbnVtYmVyID0gMTg7XHJcbiAgICBwcml2YXRlIFNISUZUX0tFWTogbnVtYmVyID0gMTY7XHJcbiAgICBwcml2YXRlIENUUkxfS0VZOiBudW1iZXIgPSAxNztcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgIENyZWF0ZXMgYSBuZXcgS2V5Ym9hcmRNYXBwZXIgaW5zdGFuY2UuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdGVBY3Rpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5rZXlib2FyZCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGk6IG51bWJlciA9IDA7IGkgPCAyNTY7IGkrKykgeyB0aGlzLmtleWJvYXJkW2ldID0gZmFsc2U7IH1cclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogICBJbnZva2VzIG5lZWRlZCBhY3Rpb24gaGFuZGxlcnMgYmFzZWQgb24gdGhlIHByZXNzZWQga2V5cy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHVwZGF0ZShjdXJyZW50U3RhdGU6IFN0YXRlKSB7XHJcblxyXG4gICAgICAgIC8vICBzdGF0ZSBzcGVjaWZpYyBoYW5kbGVyXHJcbiAgICAgICAgdmFyIGFjdGlvbnM6IEtleWJvYXJkQWN0aW9uW10gPSB0aGlzLnN0YXRlQWN0aW9uc1tjdXJyZW50U3RhdGVdO1xyXG4gICAgICAgIHRoaXMuZmluZEhhbmRsZXJBbmRJbnZva2UoYWN0aW9ucyk7XHJcblxyXG5cclxuICAgICAgICAvLyAgZ2xvYmFsIGhhbmRsZXJzXHJcbiAgICAgICAgYWN0aW9ucyA9IHRoaXMuc3RhdGVBY3Rpb25zW1N0YXRlLkdMT0JBTF07XHJcbiAgICAgICAgdGhpcy5maW5kSGFuZGxlckFuZEludm9rZShhY3Rpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICAgU2VhcmNoZXMgZm9yIGFsbCBrZXlib2FyZCBoYW5kbGVycyB3aXRoIG1hdGNoaW5nIGN1cnJlbnQgcHJlc3NlZCBrZXkgY29tYmluYXRpb25zIGFuZCBpbnZva2VzIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZmluZEhhbmRsZXJBbmRJbnZva2UoYWN0aW9uczogS2V5Ym9hcmRBY3Rpb25bXSkge1xyXG4gICAgICAgIGlmIChhY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSBhY3Rpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIga2EgPSBhY3Rpb25zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGthICYmIGthLmlzQXNzaWduZWQoKSAmJiBrYS5oYW5kbGVyXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5rZXlib2FyZFtrYS5rZXldXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5rZXlib2FyZFt0aGlzLkFMVF9LRVldID09IGthLmFsdEtleVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHRoaXMua2V5Ym9hcmRbdGhpcy5TSElGVF9LRVldID09IGthLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5rZXlib2FyZFt0aGlzLkNUUkxfS0VZXSA9PSBrYS5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAga2EuaGFuZGxlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrYS5yZWxlYXNlS2V5QWZ0ZXJJbnZva2UpIHRoaXMua2V5Ym9hcmRba2Eua2V5XSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUga2V5ZG93bihlKSB7XHJcbiAgICAgICAgdGhpcy5rZXlib2FyZFtlLndoaWNoXSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBrZXl1cChlKSB7XHJcbiAgICAgICAgdGhpcy5rZXlib2FyZFtlLndoaWNoXSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRLZXlib2FyZEFjdGlvbkhhbmRsZXIgPSAoYWN0aW9uOiBLZXlib2FyZEFjdGlvbiwgc3RhdGU6IFN0YXRlKSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlQWN0aW9uc1tzdGF0ZV0pIHRoaXMuc3RhdGVBY3Rpb25zW3N0YXRlXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdGVBY3Rpb25zW3N0YXRlXS5wdXNoKGFjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzS2V5RG93bihrZXlDb2RlOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlib2FyZFtrZXlDb2RlXTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBLZXlib2FyZEFjdGlvbiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAqICAgUmV0dXJucyB0cnVlIGlmIHRoZSBoYW5kbGVyIGlzIGFzc2lnbmVkLlxyXG4gICAgKi9cclxuICAgIHB1YmxpYyBpc0Fzc2lnbmVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZXIgIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICogICBDcmVhdGVzIGEgbmV3IEtleWJvYXJkQWN0aW9uIGluc3RhbmNlLlxyXG4gICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBrZXk6IG51bWJlcixcclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHB1YmxpYyBoYW5kbGVyOiBLZXlib2FyZEFjdGlvbkNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxyXG4gICAgICAgIHB1YmxpYyByZWxlYXNlS2V5QWZ0ZXJJbnZva2U6IGJvb2xlYW4gPSB0cnVlLFxyXG4gICAgICAgIHB1YmxpYyBzaGlmdEtleTogYm9vbGVhbiA9IGZhbHNlLFxyXG4gICAgICAgIHB1YmxpYyBjdHJsS2V5OiBib29sZWFuID0gZmFsc2UsXHJcbiAgICAgICAgcHVibGljIGFsdEtleTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2V5Ym9hcmRBY3Rpb25DYWxsYmFjayB7XHJcbiAgICAoKTogdm9pZDtcclxufVxyXG4iLCJleHBvcnQgY2xhc3MgTGlua2VkTGlzdDxUPntcclxuXHJcbiAgICBwcml2YXRlIGZpcnN0OiBMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBsYXN0OiBMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGw9IG51bGw7XHJcbiAgICBwcml2YXRlIGxlbmd0aDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IEZpcnN0KCk6IExpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3Q7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IEZpcnN0KG5vZGU6IExpbmtlZExpc3ROb2RlPFQ+fCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5maXJzdCA9IG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBMYXN0KCk6IExpbmtlZExpc3ROb2RlPFQ+fCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBMYXN0KG5vZGU6IExpbmtlZExpc3ROb2RlPFQ+fCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgQWRkTm9kZSA9IChkYXRhOiBUKTogTGlua2VkTGlzdE5vZGU8VD4gPT4ge1xyXG4gICAgICAgIHZhciBuZXdMYXN0Tm9kZSA9IG5ldyBMaW5rZWRMaXN0Tm9kZTxUPigpO1xyXG4gICAgICAgIG5ld0xhc3ROb2RlLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIG5ld0xhc3ROb2RlLnByZXZpb3VzID0gbmV3TGFzdE5vZGUubmV4dCA9IG51bGw7XHJcbiAgICAgICAgbmV3TGFzdE5vZGUubGlzdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBuZXdMYXN0Tm9kZTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbmV3TGFzdE5vZGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV3TGFzdE5vZGUucHJldmlvdXMgPSB0aGlzLmxhc3Q7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCEubmV4dCA9IG5ld0xhc3ROb2RlO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBuZXdMYXN0Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sZW5ndGgrKztcclxuICAgICAgICByZXR1cm4gbmV3TGFzdE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEluc2VydE5vZGUgPSAoZGF0YTogVCk6IExpbmtlZExpc3ROb2RlPFQ+ID0+IHtcclxuICAgICAgICB2YXIgbmV3Rmlyc3ROb2RlID0gbmV3IExpbmtlZExpc3ROb2RlPFQ+KCk7XHJcbiAgICAgICAgbmV3Rmlyc3ROb2RlLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIG5ld0ZpcnN0Tm9kZS5wcmV2aW91cyA9IG5ld0ZpcnN0Tm9kZS5uZXh0ID0gbnVsbDtcclxuICAgICAgICBuZXdGaXJzdE5vZGUubGlzdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBuZXdGaXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IG5ld0ZpcnN0Tm9kZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdGaXJzdE5vZGUubmV4dCA9IHRoaXMuZmlyc3Q7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3QucHJldmlvdXMgPSBuZXdGaXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBuZXdGaXJzdE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGVuZ3RoKys7XHJcbiAgICAgICAgcmV0dXJuIG5ld0ZpcnN0Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgUmVtb3ZlTm9kZShub2RlOiBMaW5rZWRMaXN0Tm9kZTxUPikge1xyXG4gICAgICAgIGlmIChub2RlLnByZXZpb3VzKSBub2RlLnByZXZpb3VzLm5leHQgPSBub2RlLm5leHQ7XHJcbiAgICAgICAgaWYgKG5vZGUubmV4dCkgbm9kZS5uZXh0LnByZXZpb3VzID0gbm9kZS5wcmV2aW91cztcclxuICAgICAgICB0aGlzLmxlbmd0aC0tO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBSb2xsTGVmdCgpIHtcclxuICAgICAgICB2YXIgbGFzdCA9IHRoaXMuZmlyc3Q7XHJcbiAgICAgICAgdmFyIHNlY29uZCA9IHRoaXMuZmlyc3QhLm5leHQ7XHJcbiAgICAgICAgbGFzdCEubmV4dCA9IG51bGw7XHJcbiAgICAgICAgbGFzdCEucHJldmlvdXMgPSB0aGlzLmxhc3Q7XHJcbiAgICAgICAgdGhpcy5sYXN0IS5uZXh0ID0gbGFzdDtcclxuICAgICAgICB0aGlzLmxhc3QgPSBsYXN0O1xyXG5cclxuICAgICAgICB0aGlzLmZpcnN0ID0gc2Vjb25kO1xyXG4gICAgICAgIHRoaXMuZmlyc3QhLnByZXZpb3VzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZm9yRWFjaChjYWxsYmFjazogKG5vZGU6IExpbmtlZExpc3ROb2RlPFQ+KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmZpcnN0O1xyXG4gICAgICAgIHdoaWxlIChub2RlKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUpO1xyXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmtlZExpc3ROb2RlPFQ+e1xyXG4gICAgcHVibGljIHByZXZpb3VzIDogTGlua2VkTGlzdE5vZGU8VD58bnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgbmV4dCA6IExpbmtlZExpc3ROb2RlPFQ+fCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBkYXRhITogVDtcclxuICAgIHB1YmxpYyBsaXN0ITogTGlua2VkTGlzdDxUPjtcclxuXHJcbiAgICBwdWJsaWMgSW5zZXJ0QmVmb3JlKGRhdGE6IFQpIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMubGlzdC5BZGROb2RlKGRhdGEpO1xyXG4gICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMucHJldmlvdXM7XHJcbiAgICAgICAgbm9kZS5uZXh0ID0gdGhpcztcclxuICAgICAgICBub2RlLnByZXZpb3VzID0gcHJldmlvdXM7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG5vZGU7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzKSB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBub2RlO1xyXG4gICAgICAgIH0gIFxyXG4gICAgICAgIG5vZGUubGlzdCA9IHRoaXMubGlzdDsgICBcclxuICAgICAgICB0aGlzLmxpc3QuRmlyc3QgPSB0aGlzLkZpbmRGaXJzdCgpOyAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBJbnNlcnRBZnRlcihkYXRhOiBUKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmxpc3QuQWRkTm9kZShkYXRhKTtcclxuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubmV4dDtcclxuICAgICAgICBub2RlLnByZXZpb3VzID0gdGhpcztcclxuICAgICAgICBub2RlLm5leHQgPSBuZXh0O1xyXG4gICAgICAgIHRoaXMubmV4dCA9IG5vZGU7XHJcbiAgICAgICAgaWYgKG5leHQpIHtcclxuICAgICAgICAgICAgbmV4dC5wcmV2aW91cyA9IG5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGUubGlzdCA9IHRoaXMubGlzdDtcclxuICAgICAgICB0aGlzLmxpc3QuTGFzdCA9IHRoaXMuRmluZExhc3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgRmluZEZpcnN0KCk6IExpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgICAgICB2YXIgbm9kZTogTGlua2VkTGlzdE5vZGU8VD4gPSB0aGlzO1xyXG4gICAgICAgIHdoaWxlIChub2RlLnByZXZpb3VzKSB7IG5vZGUgPSBub2RlLnByZXZpb3VzOyB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEZpbmRMYXN0KCk6IExpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgICAgICB2YXIgbm9kZTogTGlua2VkTGlzdE5vZGU8VD4gPSB0aGlzO1xyXG4gICAgICAgIHdoaWxlIChub2RlLm5leHQpIHsgbm9kZSA9IG5vZGUubmV4dDsgfVxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJztcclxuaW1wb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4nO1xyXG5cclxuLyoqXHJcbiAqICAgUmVwcmVzZW50cyBhIHBhcmFsbGF4IGJhY2tncm91bmQgd2l0aCB0ZXh0dXJlcyB0aGF0IHRpbGUgaW5zaWRlIHRoZSB2aWV3cG9ydC4gXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGFyYWxsYXggZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XHJcblxyXG4gICAgcHJpdmF0ZSB2aWV3UG9ydFNpemUhOiBQSVhJLlBvaW50O1xyXG4gICAgcHJpdmF0ZSB3b3JsZFBvc2l0aW9uOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBwYXJhbGxheEZhY3RvcjogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgc3ByaXRlQnVmZmVyOiBBcnJheTxQSVhJLlNwcml0ZT4gPSBbXTtcclxuICAgIHByaXZhdGUgc3ByaXRlT3JkZXJMaXN0OiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0b3RhbCB3aWR0aCBvZiBhbGwgdGV4dHVyZXMgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdG90YWxXaWR0aDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqICAgQ3JlYXRlcyBhIG5ldyBQYXJhbGF4U3ByaXRlIGluc3RhbmNlLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzaXplOiBQSVhJLlBvaW50LCBwYXJhbGxheEZhY3RvcjogbnVtYmVyLCB0ZXh0dXJlczogQXJyYXk8c3RyaW5nIHwgUElYSS5UZXh0dXJlPiwgcHJpdmF0ZSB0ZXh0dXJlU2NhbGU/OiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuVmlld1BvcnRTaXplID0gc2l6ZSB8fCBuZXcgUElYSS5Qb2ludCgxMDAsIDEwMCk7XHJcbiAgICAgICAgdGhpcy5wYXJhbGxheEZhY3RvciA9IHBhcmFsbGF4RmFjdG9yIHx8IDE7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlU2NhbGUgPSB0aGlzLnRleHR1cmVTY2FsZSB8fCAxO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZXModGV4dHVyZXMpO1xyXG4gICAgICAgIHRoaXMud29ybGRQb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5TZXRWaWV3UG9ydFgoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBXb3JsZFBvc2l0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud29ybGRQb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgU2V0Vmlld1BvcnRYKG5ld1Bvc2l0aW9uWDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMud29ybGRQb3NpdGlvbiAhPT0gbmV3UG9zaXRpb25YKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVQb3NpdGlvbihuZXdQb3NpdGlvblgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IFZpZXdQb3J0U2l6ZSgpOiBQSVhJLlBvaW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy52aWV3UG9ydFNpemU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IFZpZXdQb3J0U2l6ZShwb2ludDogUElYSS5Qb2ludCkge1xyXG4gICAgICAgIHRoaXMudmlld1BvcnRTaXplID0gcG9pbnQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IFBhcmFsbGF4RmFjdG9yKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYWxsYXhGYWN0b3I7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IFBhcmFsbGF4RmFjdG9yKGZhY3RvcjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbGxheEZhY3RvciA9IGZhY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0VGV4dHVyZXModGV4dHVyZXM6IEFycmF5PHN0cmluZyB8IFBJWEkuVGV4dHVyZT4pOiB2b2lkIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgIHZhciB0ZXh0dXJlSW5kZXggOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vICBnZXQgdGhlIGZpcnN0IHRleHR1cmUgdG8gZmV0Y2ggdGhlIHdpZHRoXHJcbiAgICAgICAgdmFyIHQ6IFBJWEkuVGV4dHVyZSA9IHRoaXMuZ2V0VGV4dHVyZSh0ZXh0dXJlcywgMCk7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gdC53aWR0aCAqIHRoaXMudGV4dHVyZVNjYWxlO1xyXG5cclxuICAgICAgICB3aGlsZSAodGhpcy5zcHJpdGVCdWZmZXIubGVuZ3RoIDwgMyAgfHwgICAgICAgICAgICAgICAgIC8vICBhdCBsZWFzdCAzIHRleHR1cmVzIChmb3Igc2hpZnRpbmcgcmlnaHQvbGVmdCBhbmQgY2VudHJhbClcclxuICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCdWZmZXIubGVuZ3RoIDwgdGV4dHVyZXMubGVuZ3RoIHx8ICAgIC8vICBhdCBsZWFzdCBhcyBtYW55IGFzIGdpdmVuIGluIGlucHV0XHJcbiAgICAgICAgICAgICAgIHRoaXMudG90YWxXaWR0aCA8PSB0aGlzLnZpZXdQb3J0U2l6ZS54ICsgd2lkdGggICAvLyAgYXQgbGVhc3QgdG8gY292ZXIgd2hvbGUgdmlld3BvcnQgc2l6ZSBleHRlbmRlZCBmb3Igb25lIHdpZHRoXHJcbiAgICAgICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgLy8gIGdldCB0aGUgdGV4dHVyZVxyXG4gICAgICAgICAgICB0ZXh0dXJlSW5kZXggPSBpbmRleCAlIHRleHR1cmVzLmxlbmd0aDtcclxuICAgICAgICAgICAgdCA9IHRoaXMuZ2V0VGV4dHVyZSh0ZXh0dXJlcywgdGV4dHVyZUluZGV4KTtcclxuICAgICAgICAgICAgdC5yb3RhdGUgPSA4OyAgIC8vICB0byBhZGp1c3QgZm9yIHdvcmxkQ29udGFpbmVyIHkgc2NhbGUgLTFcclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHNwcml0ZVxyXG4gICAgICAgICAgICB2YXIgc3ByID0gbmV3IFBJWEkuU3ByaXRlKHQpO1xyXG4gICAgICAgICAgICBzcHIueCA9IHRoaXMudG90YWxXaWR0aDtcclxuICAgICAgICAgICAgc3ByLnNjYWxlLnNldCh0aGlzLnRleHR1cmVTY2FsZSwgdGhpcy50ZXh0dXJlU2NhbGUpO1xyXG4gICAgICAgICAgICBzcHIuYW5jaG9yLnNldCgwLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGVCdWZmZXIucHVzaChzcHIpO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZU9yZGVyTGlzdC5wdXNoKHRoaXMuc3ByaXRlQnVmZmVyLmxlbmd0aC0xKTsgLy8gICB3aWxsIGhvbGQgc3ByaXRlIGluZGljZXMgZnJvbSBzcHJpdGVidWZmZXIgWzAsMSwyLDMsNC4uLl1cclxuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChzcHIpO1xyXG5cclxuICAgICAgICAgICAgLy8gIHVwZGF0ZSBcclxuICAgICAgICAgICAgdGhpcy50b3RhbFdpZHRoICs9IHNwci53aWR0aDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7dC5iYXNlVGV4dHVyZS5pbWFnZVVybH0gLT4gd2lkdGg6ICR7dC53aWR0aH0gc3ByIHdpZHRoOiAke3Nwci53aWR0aH0sIHRvdGFsIHdpZHRoOiAke3RoaXMudG90YWxXaWR0aH1gKTtcclxuICAgICAgICAgICAgaW5kZXgrKzsgICAgICAgICAgICBcclxuICAgICAgICB9ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFRleHR1cmUodGV4dHVyZXM6IEFycmF5PHN0cmluZyB8IFBJWEkuVGV4dHVyZT4sIHRleHR1cmVJbmRleDogbnVtYmVyKXtcclxuICAgICAgICB2YXIgdDogUElYSS5UZXh0dXJlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGV4dHVyZXNbdGV4dHVyZUluZGV4XSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvL3ZhciByZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNbdGV4dHVyZXNbdGV4dHVyZUluZGV4XSBhcyBzdHJpbmddOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBpZighcmVzIHx8ICFyZXMudGV4dHVyZSl7XHJcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmVycm9yKCd0ZXh0dXJlIG5vdCBmb3VuZDogJyArIHRleHR1cmVzW3RleHR1cmVJbmRleF0pO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIC8vIHQgPSByZXMudGV4dHVyZTtcclxuICAgICAgICAgICAgdCA9IFRleHR1cmVMb2FkZXIuR2V0KHRleHR1cmVzW3RleHR1cmVJbmRleF0gYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgLy90LmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ID0gdGV4dHVyZXNbdGV4dHVyZUluZGV4XSBhcyBQSVhJLlRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0OyBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlY2FsY3VsYXRlUG9zaXRpb24gPSAobmV3UG9zaXRpb25YOiBudW1iZXIpID0+IHtcclxuICAgICAgICBjb25zdCBmaXJzdElkeCA9IHRoaXMuc3ByaXRlT3JkZXJMaXN0WzBdO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0U3ByOiBQSVhJLlNwcml0ZSA9IHRoaXMuc3ByaXRlQnVmZmVyW2ZpcnN0SWR4XTtcclxuICAgICAgICBjb25zdCBsYXN0SWR4ID0gdGhpcy5zcHJpdGVPcmRlckxpc3RbdGhpcy5zcHJpdGVPcmRlckxpc3QubGVuZ3RoLTFdO1xyXG4gICAgICAgIGNvbnN0IGxhc3RTcHI6IFBJWEkuU3ByaXRlID0gdGhpcy5zcHJpdGVCdWZmZXJbbGFzdElkeF07IFxyXG5cclxuICAgICAgICAvLyAgdXBkYXRlIHNwcml0ZSBwb3NpdGlvbnNcclxuICAgICAgICB2YXIgZGVsdGEgPSAgKHRoaXMud29ybGRQb3NpdGlvbiAtIG5ld1Bvc2l0aW9uWCkgKiB0aGlzLnBhcmFsbGF4RmFjdG9yO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb25zKGRlbHRhKTtcclxuXHJcbiAgICAgICAgaWYgKG5ld1Bvc2l0aW9uWCA+IHRoaXMud29ybGRQb3NpdGlvbikgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyAgY2hlY2sgZm9yIHJlbW92YWxzIGZyb20gbGVmdCBzaWRlXHJcbiAgICAgICAgICAgIGlmIChmaXJzdFNwci54ICsgZmlyc3RTcHIud2lkdGggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZU9yZGVyTGlzdC5wdXNoKHRoaXMuc3ByaXRlT3JkZXJMaXN0LnNoaWZ0KCkpOyAgICAvLyAgbW92ZSBmaXJzdCBlbGVtZW50IHRvIGVuZFxyXG4gICAgICAgICAgICAgICAgZmlyc3RTcHIueCA9IGxhc3RTcHIueCArIGxhc3RTcHIud2lkdGg7ICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgY2hlY2sgZm9yIHJlbW92YWxzIGZyb20gcmlnaHQgc2lkZSAgXHJcbiAgICAgICAgICAgIGlmIChsYXN0U3ByLnggPiB0aGlzLnZpZXdQb3J0U2l6ZS54KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZU9yZGVyTGlzdC51bnNoaWZ0KHRoaXMuc3ByaXRlT3JkZXJMaXN0LnBvcCgpKTsgICAgLy8gIG1vdmUgbGFzdCBlbGVtZW50IHRvIHN0YXJ0XHJcbiAgICAgICAgICAgICAgICBsYXN0U3ByLnggPSBmaXJzdFNwci54IC0gbGFzdFNwci53aWR0aDsgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud29ybGRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uWDtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVQb3NpdGlvbnMoZGVsdGE6bnVtYmVyKXtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpPCB0aGlzLnNwcml0ZUJ1ZmZlci5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlQnVmZmVyW2ldLnBvc2l0aW9uLnggKz0gZGVsdGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnO1xyXG5pbXBvcnQgeyBTY2VuZU1hbmFnZXIgfSBmcm9tIFwiLi9TY2VuZU1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiAgIFJlcHJlc2VudHMgYSBzY2VuZS4gXHJcbiAqICAgT25seSBvbmUgc2NlbmUgYXQgYSB0aW1lIGlzIHJlbmRlcmVkLlxyXG4gKi9cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNjZW5lIGV4dGVuZHMgUElYSS5Db250YWluZXIge1xyXG4gICAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgaHVkU2NlbmU6IFBJWEkuQ29udGFpbmVyIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIGJhY2tncm91bmRDb2xvcjogbnVtYmVyO1xyXG4gICAgcHVibGljIHNjZW5lTWFuYWdlcjogU2NlbmVNYW5hZ2VyO1xyXG4gICAgcHVibGljIG9uQWN0aXZhdGUoKTogdm9pZHt9XHJcbiAgICBwdWJsaWMgb25EZWFjdGl2YXRlKCk6IHZvaWR7fVxyXG4gICAgcHVibGljIG9uUmVzaXplKCk6IHZvaWR7fVxyXG4gICAgcHVibGljIG9uVXBkYXRlKGR0OiBudW1iZXIpOnZvaWR7fTtcclxuICAgIHB1YmxpYyBvbkRlc3Ryb3kob3B0aW9ucz86IFBJWEkuRGVzdHJveU9wdGlvbnMgfCBib29sZWFuKTogdm9pZHt9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgIENyZWF0ZXMgYSBuZXcgc2NlbmUgaW5zdGFuY2UuXHJcbiAgICAgKiAgIEBwYXJhbSBuYW1lIHRoZSBzY2VuZSBuYW1lLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzY206IFNjZW5lTWFuYWdlciwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNjZW5lTWFuYWdlciA9IHNjbTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IDB4MDtcclxuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBOYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGdldCBCYWNrR3JvdW5kQ29sb3IoKTpudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRDb2xvcjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgQmFja0dyb3VuZENvbG9yKGNvbG9yOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgSHVkT3ZlcmxheSgpOiBQSVhJLkNvbnRhaW5lciB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmh1ZFNjZW5lO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBIdWRPdmVybGF5KGh1ZDogUElYSS5Db250YWluZXIgfCBudWxsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaHVkU2NlbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmh1ZFNjZW5lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5odWRTY2VuZSA9IGh1ZDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaHVkU2NlbmUpIHtcclxuICAgICAgICAgICAgdmFyIG1heEluZGV4ID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGRBdCh0aGlzLmh1ZFNjZW5lLCBtYXhJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRDaGlsZDxUIGV4dGVuZHMgUElYSS5EaXNwbGF5T2JqZWN0PihjaGlsZDogVCk6IFQge1xyXG4gICAgICAgIHZhciBkaXNwT2JqID0gc3VwZXIuYWRkQ2hpbGQoY2hpbGQpO1xyXG4gICAgICAgIGlmICh0aGlzLmh1ZFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXhJbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDaGlsZEluZGV4KHRoaXMuaHVkU2NlbmUsIG1heEluZGV4KTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGlzcE9iajtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQ2hpbGRBdDxUIGV4dGVuZHMgUElYSS5EaXNwbGF5T2JqZWN0PihjaGlsZDogVCwgaW5kZXg6IG51bWJlcik6IFQge1xyXG4gICAgICAgIHZhciBkaXNwT2JqID0gc3VwZXIuYWRkQ2hpbGRBdChjaGlsZCwgaW5kZXgpO1xyXG4gICAgICAgIGlmICh0aGlzLmh1ZFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXhJbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDaGlsZEluZGV4KHRoaXMuaHVkU2NlbmUsIG1heEluZGV4KTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGlzcE9iajtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVzdW1lKCk6dm9pZCB7XHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc1BhdXNlZCgpOmJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhdXNlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jbGVhcjpib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBnZXQgY2xlYXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsZWFyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgY2xlYXIoY2xlYXJGbGFnOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fY2xlYXIgPSBjbGVhckZsYWc7XHJcbiAgICB9ICAgIFxyXG59XHJcbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcyc7XHJcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4vU2NlbmVcIjtcclxuaW1wb3J0ICogYXMgVFdFRU4gZnJvbSBcIkB0d2VlbmpzL3R3ZWVuLmpzXCI7XHJcbmV4cG9ydCBlbnVtIFN0YXRlIHtcclxuICAgIEdMT0JBTCxcclxuICAgIE1FTlUsXHJcbiAgICBJTl9HQU1FLFxyXG4gICAgQ1VTVE9NMSxcclxuICAgIENVU1RPTTIsXHJcbiAgICBDVVNUT00zLFxyXG4gICAgQ1VTVE9NNCxcclxuICAgIENVU1RPTTUsXHJcbn1cclxuXHJcbi8vZGVjbGFyZSB2YXIgc3RhdHM6IFN0YXRzO1xyXG5cclxuLyoqXHJcbiAqICAgSGFuZGxlcyBtdWx0aXBsZSBzY2VuZXMsIHNjZW5lIGFjdGl2YXRpb24sIHJlbmRlcmluZyBhbmQgdXBkYXRlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTY2VuZU1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBtYXN0ZXJIdWRPdmVybGF5ISA6IFBJWEkuQ29udGFpbmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBvYmplY3QgaXMgb25seSB0byBzdXBwb3J0IHJlbmRlcmluZyBtYXN0ZXJIdWRPdmVybGF5IHRvZ2V0aGVyIHdpdGggdGhlIGN1cnJlbnQgc2NlbmUhISFcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBtYXN0ZXJDb250YWluZXIgOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjdXJyZW50U2NlbmU6IFNjZW5lIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIGxhc3RTY2VuZSE6IFNjZW5lO1xyXG4gICAgcHJpdmF0ZSBzY2VuZXM6IEFycmF5PFNjZW5lPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUElYSS5XZWJHTFJlbmRlcmVyIHwgUElYSS5DYW52YXNSZW5kZXJlcjtcclxuXHJcbiAgICBwcml2YXRlIGRlc2lnbldpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGRlc2lnbkhlaWdodDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzY2VuZVJlc2l6ZXI6IElTY2VuZVJlc2l6ZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFRpbWUgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBhbmltYXRpb25GcmFtZUhhbmRsZTogbnVtYmVyID0tMTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICAgQ3JlYXRlcyBhIG5ldyBTY2VuZU1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogICBAcGFyYW0gd2lkdGggdGhlIHdpZHRoIG9mIHRoZSBzY2VuZVxyXG4gICAgICogICBAcGFyYW0gaGVpZ2h0IHRoZSBoZWlnaHQgb2YgdGhlIHNjZW5lXHJcbiAgICAgKiAgIEBwYXJhbSByZXNpemVyIGN1c3RvbSByZXNpemUgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9wdGlvbnM/OiBQSVhJLlJlbmRlcmVyT3B0aW9ucywgcmVzaXplcj86IElTY2VuZVJlc2l6ZXIpIHtcclxuICAgICAgICB0aGlzLmRlc2lnbldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5kZXNpZ25IZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zY2VuZVJlc2l6ZXIgPSByZXNpemVyIHx8IG5ldyBEZWZhdWx0UmVzaXplcih0aGlzLmRlc2lnbldpZHRoLCB0aGlzLmRlc2lnbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5tYXN0ZXJDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IGFudGlhbGlhczogZmFsc2UsIHJvdW5kUGl4ZWxzOiB0cnVlLCBiYWNrZ3JvdW5kQ29sb3I6IDB4MDEyMTM1LCB0cmFuc3BhcmVudDogdHJ1ZSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIod2lkdGgsIGhlaWdodCwgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hdXRvUmVzaXplID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gIHRleHR1cmVHQyBpcyBvbmx5IHVzZWQgZm9yIHdlYiBHTCByZW5kZXJlclxyXG4gICAgICAgIGlmICgodGhpcy5yZW5kZXIgYXMgYW55KS50ZXh0dXJlR0MpIHtcclxuICAgICAgICAgICAgKHRoaXMucmVuZGVyIGFzIGFueSkudGV4dHVyZUdDLm1vZGUgPSBQSVhJLkdDX01PREVTLkFVVE87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLnJlc2l6ZUhhbmRsZXIpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVzaXplSGFuZGxlciwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgc3RhdHMuc2hvd1BhbmVsKDApOyAvLyAwIOKAkyB1c2UgdGhlIEZQUyBtb2RlLCAxIOKAkyB1c2UgdGhlIG1pbGxpc2Vjb25kcyBtb2RlXHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSBtZXRlciBpbiB0aGUgdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgICAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSBcIlwiO1xyXG4gICAgICAgIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucmlnaHQgPSBcIjIwcHhcIjtcclxuICAgICAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmJvdHRvbSA9IFwiMjBweFwiO1xyXG4gICAgICAgIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gXCJcIjsgXHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB0aGUgbWV0ZXIgdG8gdGhlIGJvZHkgb2YgeW91ciBIVE1MNSBkb2N1bWVudC5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpO1xyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogICBSZXR1cm5zIHRoZSByZW5kZXJlciBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBSZW5kZXJlcigpOiBQSVhJLldlYkdMUmVuZGVyZXIgfCBQSVhJLkNhbnZhc1JlbmRlcmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICAgUmV0dXJucyB0aGUgY3VycmVudCBzY2VuZSBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBDdXJyZW50U2NlbmUoKTogU2NlbmUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTY2VuZSBhcyBTY2VuZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICAgQWRkcyBhIHNjZW5lLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgQWRkU2NlbmUoc2NlbmU6IFNjZW5lKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnNjZW5lcy5wdXNoKHNjZW5lKTtcclxuICAgICAgICBzY2VuZS5zY2VuZU1hbmFnZXIgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogICBSZW1vdmVzIGFsbCBzY2VuZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBSZW1vdmVBbGxTY2VuZXMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zY2VuZXMuZm9yRWFjaCgoc2NlbmU6IFNjZW5lKSA9PiB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIChzY2VuZS5zY2VuZU1hbmFnZXIgYXMgYW55KSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgc2NlbmUub25EZXN0cm95KHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2NlbmVzID0gW107XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogICBSZW1vdmVzIGEgc2NlbmUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBSZW1vdmVTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNjZW5lcyA9IHRoaXMuc2NlbmVzLmZpbHRlcigoaXRlbTogU2NlbmUsIGluZGV4OiBudW1iZXIsIGFycikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbSAhPT0gc2NlbmU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgKHNjZW5lLnNjZW5lTWFuYWdlciBhcyBhbnkpID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzY2VuZSBleGlzdHMuXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgSGFzU2NlbmUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgdmFyIGZvdW5kID0gdGhpcy5zY2VuZXMuZmlsdGVyKChpdGVtOiBTY2VuZSkgPT4geyByZXR1cm4gaXRlbS5OYW1lID09PSBuYW1lOyB9KTtcclxuICAgICAgICByZXR1cm4gKGZvdW5kICYmIGZvdW5kLmxlbmd0aCA+IDApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc2NlbmUgYnkgaXRzIG5hbWUuXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgR2V0U2NlbmUobmFtZTogc3RyaW5nKTogU2NlbmV7XHJcbiAgICAgICAgdmFyIGZvdW5kID0gdGhpcy5zY2VuZXMuZmlsdGVyKChpdGVtOiBTY2VuZSkgPT4geyByZXR1cm4gaXRlbS5OYW1lID09PSBuYW1lOyB9KTtcclxuICAgICAgICBpZiAoIWZvdW5kIHx8IGZvdW5kLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIlNjZW5lOiAnXCIgKyBuYW1lICsgXCInIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZvdW5kLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJNdWx0aXBsZSBzY2VuZXM6ICdcIiArIG5hbWUgKyBcIicgZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFswXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICAgQWN0aXZhdGVzIHRoZSBnaXZlbiBzY2VuZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIEFjdGl2YXRlU2NlbmUoc2NlbmVPck5hbWU6IFNjZW5lIHwgc3RyaW5nKTp2b2lkIHsgICAgICAgXHJcbiAgICAgICAgdmFyIHNjZW5lOiBTY2VuZTtcclxuICAgICAgICBpZiAodHlwZW9mIChzY2VuZU9yTmFtZSkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgdmFyIGZvdW5kID0gdGhpcy5zY2VuZXMuZmlsdGVyKChpdGVtOlNjZW5lKSA9PiB7IHJldHVybiBpdGVtLk5hbWUgPT09IHNjZW5lT3JOYW1lOyB9KTtcclxuICAgICAgICAgICAgaWYgKCFmb3VuZCB8fCBmb3VuZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiU2NlbmU6ICdcIiArIHNjZW5lT3JOYW1lICsgXCInIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZm91bmQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJNdWx0aXBsZSBzY2VuZXM6ICdcIiArIHNjZW5lT3JOYW1lICsgXCInIGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNjZW5lID0gZm91bmRbMF07XHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICBzY2VuZSA9IHNjZW5lT3JOYW1lIGFzIFNjZW5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50U2NlbmUgLyomJiB0aGlzLmN1cnJlbnRTY2VuZS5vbkRlYWN0aXZhdGUqLyAmJiB0aGlzLmN1cnJlbnRTY2VuZSAhPT0gc2NlbmUpe1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWFjdGl2YXRlU2NlbmUgXCIgKyB0aGlzLmN1cnJlbnRTY2VuZS5OYW1lKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUub25EZWFjdGl2YXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcIkFjdGl2YXRlU2NlbmUgXCIgKyBzY2VuZS5OYW1lKTtcclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sYXN0U2NlbmUgPSAodGhpcy5jdXJyZW50U2NlbmUgIT0gc2NlbmUgPyB0aGlzLmN1cnJlbnRTY2VuZSA6IHRoaXMubGFzdFNjZW5lKSBhcyBTY2VuZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYmFja2dyb3VuZENvbG9yID0gc2NlbmUuQmFja0dyb3VuZENvbG9yO1xyXG4gICAgICAgIHRoaXMucmVzaXplSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAvL2lmIChzY2VuZS5vbkFjdGl2YXRlKSB7XHJcbiAgICAgICAgICAgIHNjZW5lLm9uQWN0aXZhdGUoKTtcclxuICAgICAgICAvL31cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1hc3RlckNvbnRhaW5lci5yZW1vdmVDaGlsZHJlbigpO1xyXG4gICAgICAgIHRoaXMubWFzdGVyQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuY3VycmVudFNjZW5lKTtcclxuICAgICAgICBpZih0aGlzLm1hc3Rlckh1ZE92ZXJsYXkpdGhpcy5tYXN0ZXJDb250YWluZXIuYWRkQ2hpbGQodGhpcy5tYXN0ZXJIdWRPdmVybGF5KTtcclxuXHJcbiAgICAgICAgUElYSS5zZXR0aW5ncy5SRVNPTFVUSU9OID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBBY3RpdmF0ZVByZXZpb3VzU2NlbmUoKSB7XHJcbiAgICAgICAgdGhpcy5BY3RpdmF0ZVNjZW5lKHRoaXMubGFzdFNjZW5lKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldHMgdGhlIG1hc3RlciBIVUQgb3ZlcmxheSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgTWFzdGVySHVkT3ZlcmxheSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hc3Rlckh1ZE92ZXJsYXk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIG1hc3RlciBIVUQgb3ZlcmxheSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgTWFzdGVySHVkT3ZlcmxheShodWQ6IFBJWEkuQ29udGFpbmVyKSB7IFxyXG4gICAgICAgIHRoaXMubWFzdGVySHVkT3ZlcmxheSA9IGh1ZDtcclxuICAgICAgICB0aGlzLm1hc3RlckNvbnRhaW5lci5yZW1vdmVDaGlsZHJlbigpO1xyXG4gICAgICAgIHRoaXMubWFzdGVyQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuY3VycmVudFNjZW5lIGFzIFNjZW5lKTtcclxuICAgICAgICBpZih0aGlzLm1hc3Rlckh1ZE92ZXJsYXkpdGhpcy5tYXN0ZXJDb250YWluZXIuYWRkQ2hpbGQodGhpcy5tYXN0ZXJIdWRPdmVybGF5KTtcclxuICAgICAgICB0aGlzLnJlc2l6ZUhhbmRsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICBSZW5kZXJzIHRoZSBjdXJyZW50IHNjZW5lIGluIGEgcmVuZGVydGV4dHVyZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIENhcHR1cmVTY2VuZSgpOiBQSVhJLlJlbmRlclRleHR1cmUge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBDYXB0dXJpbmcgc2NlbmUsIHdpZHRoOiAke3RoaXMucmVuZGVyZXIud2lkdGh9LCBoZWlnaHQ6ICR7dGhpcy5yZW5kZXJlci5oZWlnaHR9YCk7XHJcbiAgICAgICAgdmFyIHJlbmRlclRleHR1cmUgPSBQSVhJLlJlbmRlclRleHR1cmUuY3JlYXRlKHRoaXMucmVuZGVyZXIud2lkdGgsIHRoaXMucmVuZGVyZXIuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLmN1cnJlbnRTY2VuZSBhcyBTY2VuZSwgcmVuZGVyVGV4dHVyZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlbmRlclRleHR1cmU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgIENhbmNlbHMgdGhlIGFuaW1hdGlvbkZyYW1lIGxvb3AsIHJlbW92ZXMgYWxsIHNjZW5lcyBhbmQgZmluYWxseSBkZXN0cm95cyB0aGUgcmVuZGVyZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBEZXN0cm95ID0gKCkgPT4ge1xyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWVIYW5kbGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY2VuZSkgeyB0aGlzLmN1cnJlbnRTY2VuZS5wYXVzZSgpOyB9XHJcbiAgICAgICAgdGhpcy5zY2VuZXMuZm9yRWFjaCgoc2NlbmU6IFNjZW5lKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuUmVtb3ZlU2NlbmUoc2NlbmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuZGVzdHJveSh0cnVlKTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSByZXNpemVIYW5kbGVyID0gKCkgPT4ge1xyXG4gICAgICAgIHZhciBhdmxTaXplID0gdGhpcy5zY2VuZVJlc2l6ZXIuR2V0QXZhaWxhYmxlU2l6ZSgpO1xyXG4gICAgICAgIHZhciBhc3BlY3QgPSB0aGlzLnNjZW5lUmVzaXplci5HZXRBc3BlY3RSYXRpbygpO1xyXG4gICAgICAgIHZhciBzaXplID0gdGhpcy5zY2VuZVJlc2l6ZXIuQ2FsY3VsYXRlU2l6ZShhdmxTaXplLCBhc3BlY3QpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVzaXplKHNpemUueCwgc2l6ZS55KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjZW5lLnNjYWxlLnNldCh0aGlzLnNjZW5lUmVzaXplci5DYWxjdWxhdGVTY2FsZShzaXplKSk7XHJcbiAgICAgICAgICAgIC8vaWYgKHRoaXMuY3VycmVudFNjZW5lLm9uUmVzaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZS5vblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMubWFzdGVySHVkT3ZlcmxheSl7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVySHVkT3ZlcmxheS5zY2FsZS5zZXQodGhpcy5zY2VuZVJlc2l6ZXIuQ2FsY3VsYXRlU2NhbGUoc2l6ZSkpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSByZW5kZXIgPSAodGltZXN0YW1wKSA9PiB7XHJcbiAgICAgICAgLy9zdGF0cy5iZWdpbigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVIYW5kbGUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vICBmb3IgdHdlZW4gc3VwcG9ydFxyXG4gICAgICAgIFRXRUVOLnVwZGF0ZSh0aW1lc3RhbXApO1xyXG5cclxuICAgICAgICAvLyAgZXhpdCBpZiBubyBzY2VuZSBvciBwYXVzZWRcclxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNjZW5lIHx8IHRoaXMuY3VycmVudFNjZW5lLmlzUGF1c2VkKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnN0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vaWYgKHRoaXMuY3VycmVudFNjZW5lLm9uVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBkdCA9IHRpbWVzdGFtcCAtIHRoaXMuc3RhcnRUaW1lITtcclxuICAgICAgICAgICAgaWYgKGR0ID4gNTApIHtcclxuICAgICAgICAgICAgICAgIGR0ID0gNTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUub25VcGRhdGUoZHQpO1xyXG4gICAgICAgIC8vfVxyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDsgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5tYXN0ZXJDb250YWluZXIsIHVuZGVmaW5lZCwgdGhpcy5jdXJyZW50U2NlbmUuY2xlYXIpOyBcclxuICAgICAgICBcclxuICAgICAgICAvL3N0YXRzLmVuZCgpO1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERlZmF1bHRSZXNpemVyIGltcGxlbWVudHMgSVNjZW5lUmVzaXplciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZGVzaWduZWRXaWR0aDpudW1iZXIsIHByb3RlY3RlZCBkZXNpZ25lZEhlaWdodDpudW1iZXIpIHtcclxuICAgIH1cclxuICAgIHB1YmxpYyBHZXRBdmFpbGFibGVTaXplKCk6SVNpemUge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgcHVibGljIEdldEFzcGVjdFJhdGlvKCk6bnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZXNpZ25lZFdpZHRoIC8gdGhpcy5kZXNpZ25lZEhlaWdodDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBDYWxjdWxhdGVTaXplKGF2YWlsYWJsZVNpemU6IElTaXplLCBhc3BlY3Q6IG51bWJlcik6IElTaXplIHtcclxuICAgICAgICB2YXIgbWF4V2lkdGg6IG51bWJlciwgbWF4SGVpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgbWF4V2lkdGggPSBNYXRoLmZsb29yKGFzcGVjdCAqIGF2YWlsYWJsZVNpemUueSk7XHJcbiAgICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgICAgIHJldHVybiB7IHg6IE1hdGgubWluKG1heFdpZHRoLCBhdmFpbGFibGVTaXplLnggKSwgeTogTWF0aC5taW4obWF4SGVpZ2h0LCBhdmFpbGFibGVTaXplLnkpIH07XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgQ2FsY3VsYXRlU2NhbGUobmV3U2l6ZTogSVNpemUpOm51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIG5ld1NpemUueCAvIHRoaXMuZGVzaWduZWRXaWR0aDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU2l6ZSB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgIE9iamVjdCBwYXNzZWQgdG8gdGhlIFNjZW5lTWFuYWdlciBoYW5kbGluZyB2YXJpb3VzIGFzcGVjdHMgb2Ygc2NlbmUgcmVzaXppbmcuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIElTY2VuZVJlc2l6ZXIge1xyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgIFJldHVybnMgdGhlIGF2YWlsYWJsZSB3aWR0aC5cclxuICAgICAqL1xyXG4gICAgR2V0QXZhaWxhYmxlU2l6ZTogKCkgPT4gSVNpemU7XHJcblxyXG4gICAgLypcclxuICAgICAqICAgUmV0dXJucyB0aGUgZGVzaXJlZCBhc3BlY3QgcmF0aW8gZm9yIHRoZSBzdGFnZS5cclxuICAgICAqL1xyXG4gICAgR2V0QXNwZWN0UmF0aW86ICgpID0+IG51bWJlcjtcclxuXHJcbiAgICBDYWxjdWxhdGVTaXplOiAoYXZhaWxhYmxlU2l6ZTogSVNpemUsIGFzcGVjdDogbnVtYmVyKSA9PiBJU2l6ZTtcclxuXHJcbiAgICBDYWxjdWxhdGVTY2FsZShuZXdTaXplOiBJU2l6ZSk6IG51bWJlcjtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnO1xyXG5pbXBvcnQgeyBPdXRsaW5lRmlsdGVyIH0gZnJvbSAnQHBpeGkvZmlsdGVyLW91dGxpbmUnO1xyXG5pbXBvcnQgeyBUZXh0dXJlTG9hZGVyIH0gZnJvbSAnLic7XHJcblxyXG5sZXQgQ09MVU1OX1BBRERJTkcgPSAxO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNsaWRlciBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcclxuICAgIHByaXZhdGUgdGV4dHVyZUhhbmRsZTogUElYSS5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSB0ZXh0dXJlQ29udHJvbDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBmcmFtZVVwQ29udHJvbDogUElYSS5SZWN0YW5nbGU7XHJcbiAgICBwcml2YXRlIGZyYW1lSGlnaGxpZ2h0Q29udHJvbDogUElYSS5SZWN0YW5nbGU7XHJcbiAgICBwcml2YXRlIGZyYW1lRG93bkNvbnRyb2w6IFBJWEkuUmVjdGFuZ2xlO1xyXG5cclxuICAgIHByaXZhdGUgZnJhbWVVcEhhbmRsZSE6IFBJWEkuUmVjdGFuZ2xlO1xyXG4gICAgcHJpdmF0ZSBmcmFtZUhpZ2hsaWdodEhhbmRsZSE6IFBJWEkuUmVjdGFuZ2xlO1xyXG4gICAgcHJpdmF0ZSBmcmFtZURvd25IYW5kbGUhOiBQSVhJLlJlY3RhbmdsZTtcclxuXHJcbiAgICBwcml2YXRlIGlzUHJlc3NlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSB0ZXh0OiBQSVhJLlRleHQ7XHJcbiAgICBwcml2YXRlIHJlcXVlc3RlZFdpZHRoOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlcXVlc3RlZEhlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgY29udHJvbCA6IFBJWEkuU3ByaXRlO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlOiBQSVhJLlNwcml0ZTtcclxuICAgIHByaXZhdGUgaGFuZGxlV2lkdGg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdmFsdWU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBtYXhYOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1pblg6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIF9vdXRsaW5lQ29sb3I6IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHRleHR1cmVBdGxhcyBzbGlkZXIgdGV4dHVyZSwgdHdvIGNvbHVtbnMgKG91dGxpbmUsIGhhbmRsZSkgYW5kIHRocmVlIHJvd3MgKG5vcm1hbCwgaGlnaGxpZ2h0LCBwcmVzc2VkKS5cclxuICAgICAqIEBwYXJhbSBzbGlkZXJGcmFtZVdpZHRoIHdpZHRoIG9mIHRoZSBzZWNvbmQgY29sdW1uIGhvbGRpbmcgdGhlIHNsaWRlciBoYW5kbGVcclxuICAgICAqIEBwYXJhbSB4XHJcbiAgICAgKiBAcGFyYW0geVxyXG4gICAgICogQHBhcmFtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHRleHR1cmVBdGxhczogc3RyaW5nLCBzbGlkZXJGcmFtZVdpZHRoOiBudW1iZXIsIHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAgLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoeCB8fCAwLCB5IHx8IDApO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdGVkSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMucmVxdWVzdGVkV2lkdGggPSB3aWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250cm9sID0gbmV3IFBJWEkuU3ByaXRlKCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sLmFuY2hvci5zZXQoMCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNvbnRyb2wuYnV0dG9uTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29udHJvbC5jdXJzb3IgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmNvbnRyb2wpO1xyXG4gICAgICAgIHRoaXMuY29udHJvbFxyXG4gICAgICAgICAgICAub24oJ3BvaW50ZXJkb3duJywgdGhpcy5vbkJ1dHRvbkRvd24pXHJcbiAgICAgICAgICAgIC5vbigncG9pbnRlcnVwJywgdGhpcy5vbkJ1dHRvblVwKVxyXG4gICAgICAgICAgICAub24oJ3BvaW50ZXJ0YXAnLCB0aGlzLm9uQ2xpY2spXHJcbiAgICAgICAgICAgIC5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMub25CdXR0b25VcE91dHNpZGUpXHJcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgdGhpcy5vbkJ1dHRvbk92ZXIpXHJcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCB0aGlzLm9uQnV0dG9uT3V0KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuaGFuZGxlV2lkdGggPSBzbGlkZXJGcmFtZVdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlID0gbmV3IFBJWEkuU3ByaXRlKCk7XHJcbiAgICAgICAgdGhpcy5oYW5kbGUucG9zaXRpb24uc2V0KDAsIHRoaXMucmVxdWVzdGVkSGVpZ2h0LzIpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlLmFuY2hvci5zZXQoMCwgMC41KTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuaGFuZGxlKTtcclxuICAgICAgICB0aGlzLmhhbmRsZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5oYW5kbGUuYnV0dG9uTW9kZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlLmN1cnNvciA9IFwiaG92ZXJcIjtcclxuICAgICAgICB0aGlzLmhhbmRsZVxyXG4gICAgICAgICAgICAub24oJ3BvaW50ZXJkb3duJywgdGhpcy5vbkRyYWdTdGFydClcclxuICAgICAgICAgICAgLm9uKCdwb2ludGVydXAnLCB0aGlzLm9uRHJhZ0VuZClcclxuICAgICAgICAgICAgLm9uKCdwb2ludGVydXBvdXRzaWRlJywgdGhpcy5vbkRyYWdFbmQpXHJcbiAgICAgICAgICAgIC5vbigncG9pbnRlcm1vdmUnLCB0aGlzLm9uRHJhZ01vdmUpO1xyXG4gICAgICAgICAgIFxyXG5cclxuICAgICAgICAvLyAgc2V0dXAgdGV4dHVyZXNcclxuICAgICAgICB0aGlzLlNldFRleHR1cmUodGV4dHVyZUF0bGFzLCBzbGlkZXJGcmFtZVdpZHRoKTtcclxuICAgICAgICB0aGlzLklzUHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUZXh0dXJlRnJhbWVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuVmFsdWUgPSAwLjE7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXQgVmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZS5wb3NpdGlvbi54ID0gdGhpcy5tYXhYICogdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgndmFsdWVDaGFuZ2UnLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgndmFsdWVDaGFuZ2VkJywgdmFsdWUpO1xyXG4gICAgICAgIH0gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgb3V0bGluZUNvbG9yKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX291dGxpbmVDb2xvcjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgb3V0bGluZUNvbG9yKHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9vdXRsaW5lQ29sb3IgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmNvbnRyb2wuZmlsdGVycyA9IFtuZXcgT3V0bGluZUZpbHRlcigxLCB0aGlzLl9vdXRsaW5lQ29sb3IsIDAuNSldOyAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgSXNQcmVzc2VkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzUHJlc3NlZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgSXNQcmVzc2VkKHN0YXRlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5pc1ByZXNzZWQgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZUZyYW1lcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgVGV4dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBUZXh0KHRleHQ6IFBJWEkuVGV4dCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIGlmICh0aGlzLnRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0LmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgeCA9ICh0aGlzLndpZHRoIC8gdGhpcy5zY2FsZS54KSAvIDI7XHJcbiAgICAgICAgICAgIHZhciB5ID0gKHRoaXMuaGVpZ2h0IC8gdGhpcy5zY2FsZS55KSAvIDI7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dC5wb3NpdGlvbi5zZXQoeCwgeSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBvbkNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICB0aGlzLnNldFNsaWRlckZyb21lRXZlbnQoZSk7XHJcbiAgICAgICAgdGhpcy5WYWx1ZSA9IHRoaXMuZ2V0Q2FsY3VsYXRlZFZhbHVlKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhZ09mZnNldFg6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGlzRHJhZ2dpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIGdldENhbGN1bGF0ZWRWYWx1ZSgpIHtcclxuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmhhbmRsZS54IC0gdGhpcy5taW5YO1xyXG4gICAgICAgIHZhciBwY3QgPSBwb3NpdGlvbiAvIHRoaXMubWF4WDtcclxuICAgICAgICByZXR1cm4gdGhpcy5wcmVjaXNlX3JvdW5kKHBjdCwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkRyYWdTdGFydCA9IChlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICB2YXIgcG9zID0gZS5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcy5oYW5kbGUpO1xyXG4gICAgICAgIHRoaXMuZHJhZ09mZnNldFggPSBwb3MueDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgb25EcmFnRW5kID0gKGUpID0+IHtcclxuICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLlZhbHVlID0gdGhpcy5nZXRDYWxjdWxhdGVkVmFsdWUoKTtcclxuICAgICAgICBlLnN0b3BwZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25EcmFnTW92ZSA9IChlOkV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG4gICAgICAgICAgICB0aGlzLnNldFNsaWRlckZyb21lRXZlbnQoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTbGlkZXJGcm9tZUV2ZW50KGUpIHtcclxuICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSBlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzLmhhbmRsZS5wYXJlbnQpO1xyXG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcgJiYgdGhpcy5kcmFnT2Zmc2V0WCkge1xyXG4gICAgICAgICAgICBuZXdQb3NpdGlvbi54IC09IHRoaXMuZHJhZ09mZnNldFg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGFuZGxlLnggPSBNYXRoLm1pbih0aGlzLm1heFgsIE1hdGgubWF4KHRoaXMubWluWCwgbmV3UG9zaXRpb24ueCkpO1xyXG4gICAgICAgIHRoaXMuZW1pdCgndmFsdWVDaGFuZ2UnLCB0aGlzLmdldENhbGN1bGF0ZWRWYWx1ZSgpKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcHJlY2lzZV9yb3VuZChudW0sIGRlY2ltYWxzKTogbnVtYmVyIHtcclxuICAgICAgICB2YXIgdCA9IE1hdGgucG93KDEwLCBkZWNpbWFscyk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IChNYXRoLnJvdW5kKChudW0gKiB0KSArIChkZWNpbWFscyA+IDAgPyAxIDogMCkgKiAoKE1hdGggYXMgYW55KS5zaWduKG51bSkgKiAoMTAgLyBNYXRoLnBvdygxMDAsIGRlY2ltYWxzKSkpKSAvIHQpLnRvRml4ZWQoZGVjaW1hbHMpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHJlc3VsdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkJ1dHRvbkRvd24gPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlQ29udHJvbC5mcmFtZSA9IHRoaXMuZnJhbWVEb3duQ29udHJvbDtcclxuICAgICAgICB0aGlzLnRleHR1cmVIYW5kbGUuZnJhbWUgPSB0aGlzLmZyYW1lRG93bkhhbmRsZTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBvbkJ1dHRvblVwID0gKGUpID0+IHtcclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZUZyYW1lcygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIG9uQnV0dG9uVXBPdXRzaWRlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXBwbHlUZXh0dXJlRnJhbWVzKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgb25CdXR0b25PdmVyID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29udHJvbC50ZXh0dXJlLmZyYW1lID0gdGhpcy5mcmFtZUhpZ2hsaWdodENvbnRyb2w7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlSGFuZGxlLmZyYW1lID0gdGhpcy5mcmFtZUhpZ2hsaWdodEhhbmRsZTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBvbkJ1dHRvbk91dCA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmFwcGx5VGV4dHVyZUZyYW1lcygpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseVRleHR1cmVGcmFtZXMoKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlQ29udHJvbC5mcmFtZSA9IHRoaXMuaXNQcmVzc2VkID8gdGhpcy5mcmFtZURvd25Db250cm9sIDogdGhpcy5mcmFtZVVwQ29udHJvbDtcclxuICAgICAgICB0aGlzLnRleHR1cmVIYW5kbGUuZnJhbWUgPSB0aGlzLmlzUHJlc3NlZCA/IHRoaXMuZnJhbWVEb3duSGFuZGxlIDogdGhpcy5mcmFtZVVwSGFuZGxlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBTZXRUZXh0dXJlKHRleHR1cmVOYW1lOiBzdHJpbmcsIGhhbmRsZVdpZHRoOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdCA9IFRleHR1cmVMb2FkZXIuR2V0KHRleHR1cmVOYW1lKTtcclxuICAgICAgICAvLyAgcHJlcGFyZSB0ZXh0dXJlc1xyXG4gICAgICAgIHRoaXMudGV4dHVyZUNvbnRyb2wgPSBuZXcgUElYSS5UZXh0dXJlKHQuYmFzZVRleHR1cmUpO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZUNvbnRyb2wuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5TQ0FMRV9NT0RFUy5ORUFSRVNUO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZUhhbmRsZSA9IG5ldyBQSVhJLlRleHR1cmUodC5iYXNlVGV4dHVyZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gIGNhbGN1bGF0ZSByZWN0IGZyYW1lcyBmb3IgdGV4dHVyZXNcclxuICAgICAgICB2YXIgZnJhbWVIZWlnaHQgPSB0aGlzLnRleHR1cmVDb250cm9sLmhlaWdodCAvIDM7XHJcbiAgICAgICAgdmFyIGZyYW1lV2lkdGggPSB0aGlzLnRleHR1cmVDb250cm9sLndpZHRoIC0gaGFuZGxlV2lkdGggLSBDT0xVTU5fUEFERElORztcclxuICAgICAgICB0aGlzLmZyYW1lVXBDb250cm9sID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAgKiBmcmFtZUhlaWdodCwgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVIaWdobGlnaHRDb250cm9sID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDEgKiBmcmFtZUhlaWdodCwgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVEb3duQ29udHJvbCA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAyICogZnJhbWVIZWlnaHQsIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgeCA9IGZyYW1lV2lkdGggKyBDT0xVTU5fUEFERElORzsgLy8gIHRleHR1cmUgZWxlbWVudHMgYXJlIHNlcGFyYXRlZCBieSBwYWRkaW5nIHBpeGVsc1xyXG4gICAgICAgIHRoaXMuZnJhbWVVcEhhbmRsZSA9IG5ldyBQSVhJLlJlY3RhbmdsZSh4LCAwICogZnJhbWVIZWlnaHQsIGhhbmRsZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZUhpZ2hsaWdodEhhbmRsZSA9IG5ldyBQSVhJLlJlY3RhbmdsZSh4LCAxICogZnJhbWVIZWlnaHQsIGhhbmRsZVdpZHRoLCBmcmFtZUhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZURvd25IYW5kbGUgPSBuZXcgUElYSS5SZWN0YW5nbGUoeCwgMiAqIGZyYW1lSGVpZ2h0LCBoYW5kbGVXaWR0aCwgZnJhbWVIZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyBzZXQgZnJhbWVzXHJcbiAgICAgICAgdGhpcy5hcHBseVRleHR1cmVGcmFtZXMoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNvbnRyb2wudGV4dHVyZSA9IHRoaXMudGV4dHVyZUNvbnRyb2w7XHJcbiAgICAgICAgdGhpcy5jb250cm9sLndpZHRoID0gdGhpcy5yZXF1ZXN0ZWRXaWR0aDsgICAgIFxyXG4gICAgICAgIHRoaXMuY29udHJvbC5oZWlnaHQgPSB0aGlzLnJlcXVlc3RlZEhlaWdodDsgICAgIFxyXG5cclxuICAgICAgICAvLyBoYW5kbGVcclxuICAgICAgICB0aGlzLmhhbmRsZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlSGFuZGxlO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlLmhlaWdodCA9IHRoaXMucmVxdWVzdGVkSGVpZ2h0O1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5tYXhYID0gdGhpcy5yZXF1ZXN0ZWRXaWR0aCAtIHRoaXMuaGFuZGxlV2lkdGg7XHJcbiAgICAgICAgdGhpcy5taW5YID0gMDtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBQSVhJIH0gZnJvbSBcIi4uXCI7XHJcbmV4cG9ydCBjbGFzcyBUZXh0dXJlTG9hZGVye1xyXG4gICAgcHVibGljIHN0YXRpYyBHZXQgPSAoZnVsbE5hbWU6IHN0cmluZyk6IFBJWEkuVGV4dHVyZSB8IG51bGwgPT4ge1xyXG4gICAgICAgIHZhciBpZHggPSBmdWxsTmFtZS5pbmRleE9mKCcuanNvbkAnKTtcclxuICAgICAgICB2YXIgdGV4dHVyZU5hbWUgPSAoaWR4ID4gMCkgPyBmdWxsTmFtZS5zdWJzdHIoaWR4ICsgNikgOiBmdWxsTmFtZTsgXHJcbiAgICAgICAgdmFyIHJlc291cmNlTmFtZSA9ICAgIChpZHggPiAwKSA/IGZ1bGxOYW1lLnN1YnN0cigwLCBpZHggKyA1KSA6IGZ1bGxOYW1lOyAgICBcclxuICAgICAgICB2YXIgcmVzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW3Jlc291cmNlTmFtZV07XHJcblxyXG4gICAgICAgIGlmKCFyZXMpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSZXNvdXJjZTonJHtmdWxsTmFtZX0nIG5vdCBmb3VuZCFgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihyZXMubG9hZFR5cGUgPT0gMil7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMudGV4dHVyZTtcclxuICAgICAgICB9IGVsc2UgaWYocmVzLmxvYWRUeXBlID09IDEpe1xyXG4gICAgICAgICAgICB2YXIgdCA9IHJlcy50ZXh0dXJlc1t0ZXh0dXJlTmFtZV07XHJcbiAgICAgICAgICAgIHQuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5TQ0FMRV9NT0RFUy5MSU5FQVI7XHJcbiAgICAgICAgICAgIHQuYmFzZVRleHR1cmUubWlwbWFwID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSZXNvdXJjZTonJHtmdWxsTmFtZX0nIHVua25vd24gbG9hZCB0eXBlIWAsIHJlcyk7XHJcbiAgICAgICAgfSAgXHJcbiAgICAgICAgcmV0dXJuIG51bGw7ICAgICAgXHJcbiAgICB9XHJcbn0iLCJleHBvcnQge0FuaW1hdGVkU3ByaXRlLCBBbmltYXRpb25TZXF1ZW5jZX0gZnJvbSBcIi4vQW5pbWF0ZWRTcHJpdGVcIjtcclxuZXhwb3J0IHtCdXR0b24sIE91dGxpbmVNb2RlfSBmcm9tIFwiLi9CdXR0b25cIjtcclxuZXhwb3J0IHtEaWN0aW9uYXJ5fSBmcm9tIFwiLi9EaWN0aW9uYXJ5XCI7XHJcbmV4cG9ydCB7S2V5Ym9hcmRNYXBwZXJ9IGZyb20gXCIuL0tleWJvYXJkTWFwcGVyXCI7XHJcbmV4cG9ydCB7TGlua2VkTGlzdH0gZnJvbSBcIi4vTGlua2VkTGlzdFwiO1xyXG5leHBvcnQge1BhcmFsbGF4fSBmcm9tIFwiLi9QYXJhbGxheFwiO1xyXG5leHBvcnQge1NjZW5lfSBmcm9tIFwiLi9TY2VuZVwiO1xyXG5leHBvcnQge1NjZW5lTWFuYWdlciwgRGVmYXVsdFJlc2l6ZXIsIElTaXplLCBJU2NlbmVSZXNpemVyfSBmcm9tIFwiLi9TY2VuZU1hbmFnZXJcIjtcclxuZXhwb3J0IHtTbGlkZXJ9IGZyb20gXCIuL1NsaWRlclwiO1xyXG5leHBvcnQge1RleHR1cmVMb2FkZXJ9IGZyb20gXCIuL1RleHR1cmVMb2FkZXJcIjsiLCJpbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuJztcclxuaW1wb3J0IHsgQm9vdFNjZW5lIH0gZnJvbSAnLi9zY2VuZXMvQm9vdFNjZW5lJztcclxuXHJcblxyXG4vKipcclxuICogIEhlcmUgd2UganVzdCBwcmVsb2FkIGZvbnRzIHZpYSBnb29nbGUgd2ViZm9udC5qc1xyXG4gKiAgYWZ0ZXIgdGhlIGZvbnRzIGFyZSBsb2FkZWQgdGhlIGJvb3RzdHJhcGVyIGlzIHRha2luZyBvdmVyXHJcbiAqL1xyXG5cclxuY29uc3QgUFJFTE9BRF9GT05UUyA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Blcm1hbmVudCBNYXJrZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnT3JiaXRyb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnRmFyc2FuJyxcclxuICAgICAgICAgICAgICAgICAgICBdO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gd2ViZm9udCBsb2FkZXIgY29uZmlnXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmNvbnNvbGUubG9nKCdpbml0aWFsaXppbmcgZ29vZ2xlIHdlYmZvbnQgbG9hZGVyIC4uLicsIFBSRUxPQURfRk9OVFMpO1xyXG50cnkge1xyXG4gICAgdmFyIGNmZyA9IHtcclxuICAgICAgICBnb29nbGU6IHsgZmFtaWxpZXM6IFBSRUxPQURfRk9OVFMgfSxcclxuICAgICAgICBhY3RpdmU6ICgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZvbnRzIHByZWxvYWQgZmluaXNoZWQhJyk7ICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBzY20gPSBHbG9iYWwuZ2V0U2NtKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvb3QgPSBuZXcgQm9vdFNjZW5lKHNjbSk7XHJcbiAgICAgICAgICAgIHNjbS5BZGRTY2VuZShib290KTtcclxuICAgICAgICAgICAgc2NtLkFjdGl2YXRlU2NlbmUoYm9vdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgICh3aW5kb3cgYXMgYW55KS5XZWJGb250Q29uZmlnID0gY2ZnO1xyXG59XHJcbmNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhlKTtcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gc3RhcnQgd2ViZm9udCBsb2FkZXJcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLyoganNoaW50IGlnbm9yZTpzdGFydCAqL1xyXG57XHJcbiAgICB2YXIgc3JjID0gKCdodHRwczonID09PSBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCA/ICdodHRwcycgOiAnaHR0cCcpICtcclxuICAgICAgICAgICAgICAgJzovL2FqYXguZ29vZ2xlYXBpcy5jb20vYWpheC9saWJzL3dlYmZvbnQvMS93ZWJmb250LmpzJztcclxuICAgIHZhciB3ZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgd2Yuc3JjID0gc3JjO1xyXG4gICAgd2YudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xyXG4gICAgd2YuYXN5bmMgPSB0cnVlO1xyXG4gICAgdmFyIHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XHJcbiAgICBpZihzLnBhcmVudE5vZGUpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3Ziwgcyk7XHJcbn07XHJcbi8qIGpzaGludCBpZ25vcmU6ZW5kICovIiwiZXhwb3J0IGNvbnN0IFNDRU5FX1dJRFRIOiBudW1iZXIgPSAxOTIwO1xyXG5leHBvcnQgY29uc3QgU0NFTkVfSEVJR0hUOiBudW1iZXIgPSAxMDgwO1xyXG5leHBvcnQgY29uc3QgU0NFTkVfSEFMRl9XSURUSCA9IFNDRU5FX1dJRFRIIC8gMjtcclxuZXhwb3J0IGNvbnN0IFNDRU5FX0hBTEZfSEVJR0hUID0gU0NFTkVfSEVJR0hUIC8gMjtcclxuZXhwb3J0IGNvbnN0IEJUTl9XSURUSDogbnVtYmVyID0gMTIwO1xyXG5leHBvcnQgY29uc3QgQlROX0hFSUdIVDogbnVtYmVyID0gNjA7XHJcbmV4cG9ydCBjb25zdCBNRU5VX0xJTkVfSEVJR0hUID0gNjA7XHJcbmV4cG9ydCBjb25zdCBHVUlfRk9OVCA9IFwiT3JiaXRyb25cIjtcclxuXHJcbmV4cG9ydCBjb25zdCBTQ0VORV9CQUNLQ09MT1IgPSAweDExMjIzMztcclxuXHJcblxyXG5leHBvcnQgY29uc3QgQU5JTUFUSU9OX0ZQU19OT1JNQUwgPSAxNDtcclxuZXhwb3J0IGNvbnN0IEFOSU1BVElPTl9GUFNfU0xPVyA9IDQ7XHJcblxyXG5leHBvcnQgY29uc3QgQlROX1NUWUxFID0ge1xyXG4gICAgYWxpZ246IFwiY2VudGVyXCIsXHJcbiAgICBwYWRkaW5nOiAwLFxyXG4gICAgZm9udFNpemU6IDI4LFxyXG4gICAgZm9udEZhbWlseTogR1VJX0ZPTlQsXHJcbiAgICBmaWxsOiAweDQ2ZmJmZCxcclxuICAgIHN0cm9rZVRoaWNrbmVzczogMSxcclxuICAgIHN0cm9rZTogMHgwXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgVEVYVF9TVFlMRTogUElYSS5UZXh0U3R5bGVPcHRpb25zID0ge1xyXG4gICAgYWxpZ246IFwibGVmdFwiLFxyXG4gICAgcGFkZGluZzogMCxcclxuICAgIGZvbnRTaXplOiAyMSxcclxuICAgIGZvbnRGYW1pbHk6IEdVSV9GT05ULFxyXG4gICAgZmlsbDogMHhFNUU1MUIsXHJcbiAgICBzdHJva2VUaGlja25lc3M6IDMsXHJcbiAgICBzdHJva2U6IDB4MGYwZjJmLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1TR19DT0lOX1NUWUxFOiBQSVhJLlRleHRTdHlsZU9wdGlvbnMgPVxyXG57XHJcbiAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgIHBhZGRpbmc6IDAsXHJcbiAgICBmb250U2l6ZTogMjIsXHJcbiAgICBmb250RmFtaWx5OiBHVUlfRk9OVCxcclxuICAgIGZpbGw6IDB4YWFhYTAwLFxyXG4gICAgc3Ryb2tlVGhpY2tuZXNzOiAzLFxyXG4gICAgc3Ryb2tlOiAweDkwNGIxNVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1TR19IUF9TVFlMRTogUElYSS5UZXh0U3R5bGVPcHRpb25zID1cclxue1xyXG4gICAgYWxpZ246IFwiY2VudGVyXCIsXHJcbiAgICBwYWRkaW5nOiAwLFxyXG4gICAgZm9udFNpemU6IDI0LFxyXG4gICAgZm9udEZhbWlseTogR1VJX0ZPTlQsXHJcbiAgICBmaWxsOiAweDkwNGIxNSxcclxuICAgIHN0cm9rZVRoaWNrbmVzczogMyxcclxuICAgIHN0cm9rZTogMHgxMTExMTFcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBNU0dfRVhQX1NUWUxFOiBQSVhJLlRleHRTdHlsZU9wdGlvbnMgPVxyXG4gICAge1xyXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxyXG4gICAgICAgIHBhZGRpbmc6IDAsXHJcbiAgICAgICAgZm9udFNpemU6IDI0LFxyXG4gICAgICAgIGZvbnRGYW1pbHk6IEdVSV9GT05ULFxyXG4gICAgICAgIGZpbGw6IDB4ODRjMjAyLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogMyxcclxuICAgICAgICBzdHJva2U6IDB4MTEyMTExXHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1TR19XQVJOX1NUWUxFOiBQSVhJLlRleHRTdHlsZU9wdGlvbnMgPVxyXG57XHJcbiAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgIHBhZGRpbmc6IDAsXHJcbiAgICBmb250U2l6ZTogMjcsXHJcbiAgICBmb250RmFtaWx5OiBHVUlfRk9OVCxcclxuICAgIGZpbGw6IDB4ZmYwMDExLFxyXG4gICAgc3Ryb2tlVGhpY2tuZXNzOiA0LFxyXG4gICAgc3Ryb2tlOiAweDIyMjIyMlxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEVYUF9CQVJfU1RZTEU6IFBJWEkuVGV4dFN0eWxlT3B0aW9ucyA9XHJcbntcclxuICAgIGFsaWduOiBcImNlbnRlclwiLFxyXG4gICAgcGFkZGluZzogMCxcclxuICAgIGZvbnRTaXplOiAxMyxcclxuICAgIGZvbnRGYW1pbHk6IEdVSV9GT05ULFxyXG4gICAgZmlsbDogMHgxMTExMTEsXHJcbiAgICBzdHJva2VUaGlja25lc3M6IDQsXHJcbiAgICBzdHJva2U6IDB4ZmZmZmZmXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgUVVFU1RfSVRFTV9TVFlMRTogUElYSS5UZXh0U3R5bGVPcHRpb25zID1cclxuICAgIHtcclxuICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgICAgICBwYWRkaW5nOiAwLFxyXG4gICAgICAgIGZvbnRTaXplOiAyOCxcclxuICAgICAgICBmb250RmFtaWx5OiBcIkZhcnNhblwiLFxyXG4gICAgICAgIGZpbGw6IDB4ODRjMmYyLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogNCxcclxuICAgICAgICBzdHJva2U6IDB4MTExMTIxXHJcbiAgICB9O1xyXG5cclxuICAgIGV4cG9ydCBjb25zdCBRVUVTVF9TVFlMRTogUElYSS5UZXh0U3R5bGVPcHRpb25zID1cclxuICAgIHtcclxuICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgICAgICBwYWRkaW5nOiAwLFxyXG4gICAgICAgIGZvbnRTaXplOiAzMCxcclxuICAgICAgICBmb250RmFtaWx5OiBcIkZhcnNhblwiLFxyXG4gICAgICAgIGZpbGw6IDB4ZmZmZmZmLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogMixcclxuICAgICAgICBzdHJva2U6IDB4OGE4MzQzLFxyXG4gICAgICAgIGRyb3BTaGFkb3c6IHRydWUsXHJcbiAgICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2LFxyXG4gICAgICAgIGRyb3BTaGFkb3dCbHVyOjNcclxuICAgIH07IiwiZXhwb3J0IGVudW0gQmFzZVN0YXRUeXBlIHtcclxuICAgIE1heEhQLFxyXG4gICAgTWF4RHVzdCxcclxuICAgIFJlZ2VuSFAsXHJcbiAgICBSZWdlbkR1c3QsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFN0YXRUeXBlIHtcclxuICAgIE1heEhQLFxyXG4gICAgSFAsXHJcblxyXG4gICAgTWF4RHVzdCxcclxuICAgIER1c3QsXHJcblxyXG4gICAgUmVnZW5IUCxcclxuICAgIFJlZ2VuRHVzdCxcclxuXHJcbiAgICBDb2lucyxcclxuICAgIEdvbGQsICAgICAgICAgICAvLyAgbm90IHVzZWRcclxuXHJcbiAgICBMZXZlbEV4cCwgICAgICAgLy8gY2FsY3VsYXRlZCB2YWx1ZTogY3VycmVudCBsZXZlbCBleHAsIHN0YXJ0cyBmcm9tIDAgZWFjaCBsZXZlbFxyXG4gICAgTGV2ZWxNYXhFeHAsICAgIC8vIGNhbGN1bGF0ZWQgdmFsdWU6IGN1cnJlbnQgbGV2ZWwgZXhwIG5lZWRlZCB0byByZWFjaCBuZXh0IGxldmVsIFxyXG4gICAgVG90YWxFeHAsICAgICAgIC8vIHRvdGFsIGV4cCAgXHJcblxyXG4gICAgQXR0cmlidXRlUG9pbnRzLFxyXG5cclxuICAgIENoYXJhY3RlckxldmVsLCAvLyBjYWxjdWxhdGVkIHZhbHVlOiBjdXJyZW50IGNoYXIgbGV2ZWwgYmFzZWQgb24gdG90YWwgZXhwZXJpZW5jZVxyXG59XHJcblxyXG5leHBvcnQgZW51bSBEYW1hZ2VUeXBlIHtcclxuICAgIExhdmFCb3JkZXIgPSAxMDAwLFxyXG4gICAgTGF2YSA9IDEwMDEsXHJcbiAgICBQb2lzb24gPSAxMDAyXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZW51bSBBdHJUeXBlIHtcclxuICAgIEhQLFxyXG4gICAgQXRrLFxyXG4gICAgQXRrQ0QsXHJcbiAgICBEZWYsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIERpcmVjdGlvbkgge1xyXG4gICAgTGVmdCxcclxuICAgIFJpZ2h0LFxyXG59IiwiaW1wb3J0IHsgU3RhdFR5cGUgfSBmcm9tICcuL2VudW1zJztcclxuXHJcbmV4cG9ydCB2YXIgZXZlbnRFbWl0dGVyID0gbmV3IFBJWEkudXRpbHMuRXZlbnRFbWl0dGVyKCk7XHJcbmV4cG9ydCB2YXIgTU9WRV9UT1BJQyA9IFwiTU9WRVwiO1xyXG5leHBvcnQgdmFyIEJVUk5fVE9QSUMgPSBcIkJVUk5cIjtcclxuZXhwb3J0IHZhciBTVEFUQ0hBTkdFX1RPUElDID0gXCJTVEFUQ0hBTkdFXCI7XHJcbmV4cG9ydCB2YXIgREFNQUdFX1RPUElDID0gXCJEQU1BR0VcIjtcclxuXHJcbi8vICBhY3Rpb24gc2lnbmFsaW5nIHRvcGljc1xyXG5leHBvcnQgdmFyIEdST1VORF9TSEFLRSA9IFwiU0hBS0VcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVN0YXRDaGFuZ2VFdmVudCB7XHJcbiAgICBUeXBlOiBTdGF0VHlwZTtcclxuICAgIE9sZFZhbHVlOiBudW1iZXI7XHJcbiAgICBOZXdWYWx1ZTogbnVtYmVyO1xyXG4gICAgU3RhdHM6IEFycmF5PG51bWJlcj47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSURwc0NoYW5nZUV2ZW50IHtcclxuICAgIE9sZFZhbHVlOiBudW1iZXI7XHJcbiAgICBBbW91bnQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQnVybkNoYW5nZUV2ZW50IHtcclxuICAgIHdhc0J1cm5pbmc6IGJvb2xlYW47XHJcbiAgICBpc0J1cm5pbmc6IGJvb2xlYW47XHJcbn0iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gXCJwaXhpLmpzXCI7XHJcbmltcG9ydCAqIGFzIHBhcnRpY2xlcyBmcm9tIFwicGl4aS1wYXJ0aWNsZXNcIjtcclxuaW1wb3J0IHsgU2NlbmVNYW5hZ2VyIH0gZnJvbSBcIi4vX2VuZ2luZVwiO1xyXG5pbXBvcnQgeyBJUm9vdE9iamVjdCB9IGZyb20gJy4vd29ybGQvTGV2ZWxJbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgU0NFTkVfSEVJR0hULCBTQ0VORV9XSURUSCB9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIFRoZSBnbG9iYWwgc2NlbmUgbWFuYWdlci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTY20oKSB7XHJcbiAgICBpZiAoIXNjZW5lTWFuYWdlcikge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YWdlXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHJlbmRlck9wdGlvbnM6IFBJWEkuUmVuZGVyZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB2aWV3OiBjYW52YXMsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogMCxcclxuICAgICAgICAgICAgYW50aWFsaWFzOiB0cnVlLFxyXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogZmFsc2UsXHJcbiAgICAgICAgICAgIHJvdW5kUGl4ZWxzOiB0cnVlLFxyXG4gICAgICAgICAgICByZXNvbHV0aW9uOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NlbmVNYW5hZ2VyID0gbmV3IFNjZW5lTWFuYWdlcihTQ0VORV9XSURUSCwgU0NFTkVfSEVJR0hULCByZW5kZXJPcHRpb25zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzY2VuZU1hbmFnZXI7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZVNjbSgpIHtcclxuICAgIGlmIChzY2VuZU1hbmFnZXIpIHtcclxuICAgICAgICBzY2VuZU1hbmFnZXIuUmVuZGVyZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgKHNjZW5lTWFuYWdlciBhcyBhbnkpID0gdW5kZWZpbmVkO1xyXG59XHJcbmxldCBzY2VuZU1hbmFnZXI6IFNjZW5lTWFuYWdlcjtcclxuXHJcbi8qKlxyXG4gKiBQbGF5ZXIgcG9zaXRpb24uXHJcbiAqL1xyXG5leHBvcnQgdmFyIHBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoKTtcclxuXHJcbmV4cG9ydCB2YXIgd29ybGRDb250YWluZXIgOiBQSVhJLkNvbnRhaW5lcjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXJ0aWNsZUVtaXR0ZXIoY29udGFpbmVyOiBQSVhJLkNvbnRhaW5lciwgdGV4dHVyZXM6IFBJWEkuVGV4dHVyZVtdLCBjb25maWc/OiBhbnkpOiBwYXJ0aWNsZXMuRW1pdHRlciB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBjZmc6IGFueSA9IHtcclxuICAgICAgICBhbHBoYToge1xyXG4gICAgICAgICAgICBzdGFydDogMC44LFxyXG4gICAgICAgICAgICBlbmQ6IDAuMDNcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbG9yOiB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBcIiNkY2ZmMDlcIixcclxuICAgICAgICAgICAgZW5kOiBcIiM5ZjFmMWZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgc3RhcnQ6IDAuMSxcclxuICAgICAgICAgICAgZW5kOiAwLjQsXHJcbiAgICAgICAgICAgIG1pbmltdW1TY2FsZU11bHRpcGxpZXI6IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNwZWVkOiB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiA1MCxcclxuICAgICAgICAgICAgZW5kOiAzLFxyXG4gICAgICAgICAgICBtaW5pbXVtU3BlZWRNdWx0aXBsaWVyOiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY2NlbGVyYXRpb246IG5ldyBQSVhJLlBvaW50KCksXHJcbiAgICAgICAgc3RhcnRSb3RhdGlvbjoge1xyXG4gICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgIG1heDogMzYwXHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3RhdGlvblNwZWVkOiB7XHJcbiAgICAgICAgICAgIG1pbjogNSxcclxuICAgICAgICAgICAgbWF4OiAyMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGlmZXRpbWU6IHtcclxuICAgICAgICAgICAgbWluOiAwLjQsXHJcbiAgICAgICAgICAgIG1heDogMS4wXHJcbiAgICAgICAgfSxcclxuICAgICAgICBibGVuZE1vZGU6IFwiYWRkXCIsXHJcbiAgICAgICAgZnJlcXVlbmN5OiAwLjAxLFxyXG4gICAgICAgIGVtaXR0ZXJMaWZldGltZTogLTEsXHJcbiAgICAgICAgbWF4UGFydGljbGVzOiAyMDAsXHJcbiAgICAgICAgcG9zOiBuZXcgUElYSS5Qb2ludCgwLCAtMjQpLFxyXG4gICAgICAgIGFkZEF0QmFjazogZmFsc2UsXHJcbiAgICAgICAgc3Bhd25UeXBlOiBcImNpcmNsZVwiLFxyXG4gICAgICAgIHNwYXduQ2lyY2xlOiB7XHJcbiAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgIHI6IDEwXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlmIChjb25maWcpIHtcclxuICAgICAgICBjZmcgPSB7IC4uLmNmZywgLi4uY29uZmlnIH07XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVtaXR0ZXIgPSBuZXcgcGFydGljbGVzLkVtaXR0ZXIoXHJcbiAgICAgICAgLy8gdGhlIFBJWEkuQ29udGFpbmVyIHRvIHB1dCB0aGUgZW1pdHRlciBpblxyXG4gICAgICAgIC8vIGlmIHVzaW5nIGJsZW5kIG1vZGVzLCBpdCdzIGltcG9ydGFudCB0byBwdXQgdGhpc1xyXG4gICAgICAgIC8vIG9uIHRvcCBvZiBhIGJpdG1hcCwgYW5kIG5vdCB1c2UgdGhlIHJvb3Qgc3RhZ2UgQ29udGFpbmVyXHJcbiAgICAgICAgY29udGFpbmVyLFxyXG4gICAgICAgIHRleHR1cmVzLFxyXG4gICAgICAgIGNmZ1xyXG4gICAgKTtcclxuICAgIGVtaXR0ZXIuZW1pdCA9IGZhbHNlO1xyXG4gICAgcmV0dXJuIGVtaXR0ZXI7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTGV2ZWxEZWZpbml0aW9uczogSVJvb3RPYmplY3QgPSB7XHJcbiAgICAgICAgdGVtcGxhdGVzOiB1bmRlZmluZWQsXHJcbiAgICAgICAgbGV2ZWxzOiB1bmRlZmluZWQsXHJcbiAgICAgICAgcXVlc3RzOiB1bmRlZmluZWRcclxufTsiLCJpbXBvcnQgKiBhcyBwaXhpIGZyb20gJ3BpeGkuanMnO1xyXG5leHBvcnQgdmFyIFBJWEkgPSBwaXhpO1xyXG5cclxuaW1wb3J0ICogYXMgZyBmcm9tIFwiLi9nbG9iYWxcIjtcclxuZXhwb3J0IHZhciBHbG9iYWwgPSBnO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vX2VuZ2luZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9jb25zdGFudHNcIjsiLCJpbXBvcnQgKiBhcyBHbG9iYWwgZnJvbSBcIi4uL2dsb2JhbFwiO1xyXG5pbXBvcnQgeyBNb2J9IGZyb20gXCIuL01vYlwiO1xyXG5pbXBvcnQgeyBBdHJUeXBlLCBEaXJlY3Rpb25IIH0gZnJvbSAnLi4vZW51bXMnO1xyXG5cclxuLyoqXHJcbiAqIE1heCBkaXN0YW5jZSBhdCB3aGljaCB0aGUgdGFyZ2V0IGNhbiBiZSBhY3F1aXJlZC5cclxuICovXHJcbmxldCBMT0NLX0RJU1RBTkNFID0gODAwO1xyXG5cclxuLyoqXHJcbiAqIE1heCBkaXN0YW5jZSBhdCB3aGljaCB0aGUgdGFyZ2V0IGlzIHRyYWNrZWQuXHJcbiAqL1xyXG5sZXQgVFJBQ0tfRElTVEFOQ0UgPSAxMDUwO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZm9yIGFsbCBtb2IgQUkuIFByb3ZpZGVzIGxvdyBsZXZlbCBBSSBmdW5jdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQUkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJ1ZSBpZiB0aGUgQUkgaGFzIGEgJ3RhcmdldCBsb2NrJyBvbiB0aGUgcGxheWVyLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgaGFzVGFyZ2V0OiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzdGFuY2UgZnJvbSBwbGF5ZXIuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB0YXJnZXREaXN0YW5jZTogbnVtYmVyO1xyXG5cclxuICAgIHByb3RlY3RlZCBsYXN0RmlyZTogbnVtYmVyID0gMDsvL3BlcmZvcm1hbmNlLm5vdygpICsgTWF0aC5yYW5kb20oKSAqIDEwOyAgICAvLyAgc28gdGhhdCB0aGUgYXR0YWNrIGlzIG5vdCB0cmlnZ2VyZWQgYXQgaW5pdCB0aW1lXHJcblxyXG4gICAgcHJvdGVjdGVkIGF0dGFja0NEOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJvdGVjdGVkIG1vYkVudGl0eTogTW9iKSB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2tDRCA9IG1vYkVudGl0eS5hdHRyaWJ1dGVzW0F0clR5cGUuQXRrQ0RdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY0Rpc3RhbmNlKCkge1xyXG4gICAgICAgIGxldCBkeCA9IEdsb2JhbC5wb3NpdGlvbi54IC0gdGhpcy5tb2JFbnRpdHkueDtcclxuICAgICAgICBsZXQgZHkgPSBHbG9iYWwucG9zaXRpb24ueSAtIHRoaXMubW9iRW50aXR5Lnk7XHJcbiAgICAgICAgdGhpcy50YXJnZXREaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0dXJuVG93YXJkc1RhcmdldCgpIHtcclxuICAgICAgICAvLyAgbmVnYXRpdmUgbGVmdCwgcG9zaXRpdmUgcmlnaHRcclxuICAgICAgICBsZXQgZGlyID0gR2xvYmFsLnBvc2l0aW9uLnggLSB0aGlzLm1vYkVudGl0eS54O1xyXG5cclxuICAgICAgICBpZiAoZGlyIDwgMCAmJiB0aGlzLm1vYkVudGl0eS5kaXJlY3Rpb24gIT0gRGlyZWN0aW9uSC5MZWZ0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9iRW50aXR5LmRpcmVjdGlvbiA9IERpcmVjdGlvbkguTGVmdDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRpciA+IDAgJiYgdGhpcy5tb2JFbnRpdHkuZGlyZWN0aW9uICE9IERpcmVjdGlvbkguUmlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5tb2JFbnRpdHkuZGlyZWN0aW9uID0gRGlyZWN0aW9uSC5SaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNhbkZpcmUoKSB7XHJcbiAgICAgICAgbGV0IG5vd01pbGxpc2Vjb25kcyA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sYXN0RmlyZSArIHRoaXMuYXR0YWNrQ0QgPD0gbm93TWlsbGlzZWNvbmRzKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlID0gKGR0OiBudW1iZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNhbGNEaXN0YW5jZSgpO1xyXG5cclxuICAgICAgICAvLyAgVE9ETzogaW1wbGVtZW50IHZpc2liaWxpdHkgY2hlY2tcclxuICAgICAgICBpZiAodGhpcy50YXJnZXREaXN0YW5jZSA8IFRSQUNLX0RJU1RBTkNFKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHVyblRvd2FyZHNUYXJnZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRhcmdldERpc3RhbmNlIDwgTE9DS19ESVNUQU5DRSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhc1RhcmdldCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyAgY2hlY2sgYXR0YWNrIENEICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbkZpcmUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2JFbnRpdHkuYXR0YWNrKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RGaXJlID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhhc1RhcmdldCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEFJIH0gZnJvbSBcIi4vQUlcIjtcclxuaW1wb3J0IHsgTW9iIH0gZnJvbSBcIi4vTW9iXCI7XHJcblxyXG4vKipcclxuICogQ2FuIGF0dGFjayBhbmQgdHVybiB0b3dhcmRzIHBsYXllciBidXQgaW52b2tlcyBubyBvdGhlciBhY3Rpb25zLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJhc2ljU3RhdGljQUkgZXh0ZW5kcyBBSSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iRW50aXR5OiBNb2IpIHtcclxuICAgICAgICBzdXBlcihtb2JFbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5GaXJlKCkge1xyXG4gICAgICAgIGxldCBub3dNaWxsaXNlY29uZHMgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBsZXQgcm5kID0gTWF0aC5yYW5kb20oKSAqIDIwMDA7XHJcbiAgICAgICAgbGV0IGNhbiA9ICh0aGlzLmxhc3RGaXJlICsgdGhpcy5hdHRhY2tDRCAgKyBybmQgPD0gbm93TWlsbGlzZWNvbmRzKTtcclxuICAgICAgICBpZiAoY2FuKSB7XHJcbiAgICAgICAgICAgIGxldCBybmQgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICBjYW4gPSBjYW4gJiYgcm5kID4gMC4zO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RGaXJlID0gcGVyZm9ybWFuY2Uubm93KCk7IC8vICBzZXQgdG8gcHJldmVudCBmaXJpbmcgaW4gbmV4dCB1cGRhdGUgaWYgJ2NhbicgaXMgZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNhbjtcclxuICAgIH07XHJcbn0iLCJpbXBvcnQgeyBBbmltYXRlZFNwcml0ZSwgQW5pbWF0aW9uU2VxdWVuY2UgfSBmcm9tIFwiLi4vX2VuZ2luZS9BbmltYXRlZFNwcml0ZVwiO1xyXG5pbXBvcnQgeyBCdWxsZXQgfSBmcm9tIFwiLi4vb2JqZWN0cy9CdWxsZXRcIjtcclxuaW1wb3J0IHsgc25kIH0gZnJvbSBcIi4uL3dvcmxkL1NvdW5kTWFuXCI7XHJcbmltcG9ydCB7IEFJIH0gZnJvbSBcIi4vQUlcIjtcclxuaW1wb3J0IHsgQmFzaWNTdGF0aWNBSSB9IGZyb20gXCIuL0Jhc2ljU3RhdGljQUlcIjtcclxuaW1wb3J0IHsgd3AyIH0gZnJvbSAnLi4vd29ybGQvV29ybGRQMic7XHJcbmltcG9ydCB7IERpcmVjdGlvbkgsIEF0clR5cGUgfSBmcm9tICcuLi9lbnVtcyc7XHJcblxyXG5jb25zdCBGUkFNRV9TSVpFOiBudW1iZXIgPSA0ODtcclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBtb25zdGVyIGVudGl0eVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE1vYiBleHRlbmRzIEFuaW1hdGVkU3ByaXRlIHtcclxuXHJcbiAgICBwcml2YXRlIG9uRGVhdGhDYWxsQmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgX2lzRGVhZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBfYXR0cmlidXRlczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIF9haTogQUk7XHJcbiAgICBwcml2YXRlIF9kaXJlY3Rpb246IERpcmVjdGlvbkg7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdGV4dHVyZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9ucyhuZXcgQW5pbWF0aW9uU2VxdWVuY2UoXCJsZWZ0XCIsIHRoaXMudGV4dHVyZU5hbWUsIFswLCAxLCAyXSwgRlJBTUVfU0laRSwgRlJBTUVfU0laRSkpO1xyXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9ucyhuZXcgQW5pbWF0aW9uU2VxdWVuY2UoXCJyaWdodFwiLCB0aGlzLnRleHR1cmVOYW1lLCBbMywgNCwgNV0sIEZSQU1FX1NJWkUsIEZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwibGF0a1wiLCB0aGlzLnRleHR1cmVOYW1lLCBbNiwgNywgOF0sIEZSQU1FX1NJWkUsIEZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwicmF0a1wiLCB0aGlzLnRleHR1cmVOYW1lLCBbOSwgMTAsIDExXSwgRlJBTUVfU0laRSwgRlJBTUVfU0laRSkpO1xyXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9ucyhuZXcgQW5pbWF0aW9uU2VxdWVuY2UoXCJsc3F1aXNoXCIsIHRoaXMudGV4dHVyZU5hbWUsIFsxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSwgRlJBTUVfU0laRSwgRlJBTUVfU0laRSkpO1xyXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9ucyhuZXcgQW5pbWF0aW9uU2VxdWVuY2UoXCJyc3F1aXNoXCIsIHRoaXMudGV4dHVyZU5hbWUsIFsxOCwgMTksIDIwLCAyMSwgMjIsIDIzXSwgRlJBTUVfU0laRSwgRlJBTUVfU0laRSkpO1xyXG4gICAgICAgIHRoaXMucGxheShcImxlZnRcIik7ICAgXHJcbiAgICAgICAgdGhpcy5fZGlyZWN0aW9uID0gRGlyZWN0aW9uSC5MZWZ0OyAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzRGVhZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNEZWFkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBpc0RlYWQodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodmFsdWUgIT0gdGhpcy5faXNEZWFkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzRGVhZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNEZWFkICYmIHRoaXMub25EZWF0aENhbGxCYWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRGVhdGhDYWxsQmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgb25EZWF0aChjYjogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMub25EZWF0aENhbGxCYWNrID0gY2I7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IG9uRGVhdGgoKTogKCkgPT4gdm9pZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub25EZWF0aENhbGxCYWNrO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRleHR1cmUgdXNlZCBmb3IgYXR0YWNrcyBlbWl0dGVkIGJ5IHRoZSBtb2IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhdGtUZXh0dXJlOiBzdHJpbmcgfCBzdHJpbmdbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEtpbGxzIHRoZSBtb2IsIHBsYXlzIHNxdWlzaCBhbmltYXRpb24gYW5kIHNvdW5kLiBPcHRpb25hbHkgaW52b2tlcyB0aGUgY2FsbCBiYWNrIG9uIGFuaW1hdGlvbiBlbmQuXHJcbiAgICAgKiBAcGFyYW0gY2JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNxdWlzaChjYj86ICgpID0+IHZvaWQpIHsgICAgIFxyXG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTsgICBcclxuICAgICAgICB2YXIgYW5hbWUgPSAodGhpcy5fZGlyZWN0aW9uID09IERpcmVjdGlvbkguTGVmdCA/IFwibHNxdWlzaFwiIDogXCJyc3F1aXNoXCIpO1xyXG4gICAgICAgIHRoaXMub25Db21wbGV0ZSA9IGNiO1xyXG4gICAgICAgIHRoaXMucGxheShhbmFtZSwgMTIsIGZhbHNlKTtcclxuICAgICAgICBzbmQubW9iU3F1aXNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBkaXJlY3Rpb24oKTogRGlyZWN0aW9uSCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgZGlyZWN0aW9uKGRpcjogRGlyZWN0aW9uSCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9kaXJlY3Rpb24gIT0gZGlyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcjtcclxuICAgICAgICAgICAgaWYgKGRpciA9PT0gRGlyZWN0aW9uSC5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoXCJsZWZ0XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KFwicmlnaHRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBhdHRyaWJ1dGVzKHZhbHVlczogbnVtYmVyW10pIHtcclxuICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzID0gdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBhdHRyaWJ1dGVzKCk6IG51bWJlcltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXR0cmlidXRlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXR0YWNrID0gKCk9PiB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXEgPSB0aGlzLmN1cnJlbnRTZXF1ZW5jZTtcclxuICAgICAgICB2YXIgY3VycmVudEZwcyA9IHRoaXMuZnBzO1xyXG4gICAgICAgIHNuZC5hdGtNYWdpYzEoKTtcclxuICAgICAgICBpZiAodGhpcy5fZGlyZWN0aW9uID09IERpcmVjdGlvbkguTGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoXCJsYXRrXCIsIGN1cnJlbnRGcHMsIGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoXCJyYXRrXCIsIGN1cnJlbnRGcHMsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub25Db21wbGV0ZSA9IChzZXE6IEFuaW1hdGlvblNlcXVlbmNlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZUJ1bGxldCgpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoY3VycmVudFNlcS5zZXF1ZW5jZU5hbWUsIGN1cnJlbnRGcHMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlQnVsbGV0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmF0a1RleHR1cmUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XHJcbiAgICAgICAgICAgIC8vICBUT0RPOiBhbmltYXRlZCBzcHJpdGVcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgc3ByaXRlXHJcbiAgICAgICAgICAgIEJ1bGxldC5lbWl0QnVsbGV0KHRoaXMuYXRrVGV4dHVyZSBhcyBzdHJpbmcsIHRoaXMucG9zaXRpb24sIHdwMi5wbGF5ZXJCb2R5LnBvc2l0aW9uLCB0aGlzLl9hdHRyaWJ1dGVzW0F0clR5cGUuQXRrXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVBSShhaVR5cGVOYW1lOiBzdHJpbmcpOnZvaWQge1xyXG4gICAgICAgIHN3aXRjaCAoYWlUeXBlTmFtZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJiYXNpY19zdGF0aWNcIjpcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FpID0gbmV3IEJhc2ljU3RhdGljQUkodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJiYXNpY1wiOlxyXG4gICAgICAgICAgICAgICAgLy8gIFRPRE86IGltcGxlbWVudCBBSSBsb2dpYyB2YXJpYXRpb25zIFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblVwZGF0ZShkdDogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIub25VcGRhdGUoZHQpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuaXNEZWFkICYmICF0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9haS5vblVwZGF0ZShkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgTGV2ZWxMb2FkZXIgfSBmcm9tIFwiLi4vd29ybGQvTGV2ZWxMb2FkZXJcIjtcclxuaW1wb3J0IHsgd3AyIH0gZnJvbSBcIi4uL3dvcmxkL1dvcmxkUDJcIjtcclxuaW1wb3J0IHsgTW9iIH0gZnJvbSBcIi4uL21vYnMvTW9iXCI7XHJcbmltcG9ydCB7IEFuaW1hdGVkU3ByaXRlLCBBbmltYXRpb25TZXF1ZW5jZSB9IGZyb20gXCIuLi9fZW5naW5lL0FuaW1hdGVkU3ByaXRlXCI7XHJcbmltcG9ydCB7IHN0YXRzIH0gZnJvbSAnLi4vb2JqZWN0cy9QbGF5ZXJTdGF0cyc7XHJcbmltcG9ydCB7IEdsb2JhbCB9IGZyb20gJy4uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTcGF3blBvaW50IHtcclxuICAgIHByaXZhdGUgbW9iQ291bnQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIG5leHRTcGF3bjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgd29ybGRDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcHJpdmF0ZSB4OiBudW1iZXIsXHJcbiAgICAgICAgcHJpdmF0ZSB5OiBudW1iZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBhcmVhOiBudW1iZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBtYXhNb2JDb3VudDogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcmVzcGF3blNlY29uZHM6IG51bWJlcixcclxuICAgICAgICBwcml2YXRlIGVudGl0eTogYW55LFxyXG4gICAgICAgIHByaXZhdGUgYWN0aXZlOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMubmV4dFNwYXduID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgSXNBY3RpdmUoKSB7IHJldHVybiB0aGlzLmFjdGl2ZTsgfTtcclxuICAgIHB1YmxpYyBzZXQgSXNBY3RpdmUodmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5hY3RpdmUgPSB2YWx1ZTsgfTtcclxuXHJcbiAgICBwdWJsaWMgb25VcGRhdGUoZHQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiB0aGlzLm1vYkNvdW50IDwgdGhpcy5tYXhNb2JDb3VudCkge1xyXG5cclxuICAgICAgICAgICAgLy8gIGlzIGl0IHRpbWUgdG8gcmVzcGF3bj9cclxuICAgICAgICAgICAgdmFyIG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmV4dFNwYXduIDw9IG5vdykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy53b3JsZENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud29ybGRDb250YWluZXIgPSAoR2xvYmFsLmdldFNjbSgpLkdldFNjZW5lKFwiTWFpblwiKSBhcyBhbnkpLndvcmxkQ29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIG1vYkJvZHkgPSBMZXZlbExvYWRlci5jcmVhdGVNb2Ioc3RhdHMuY3VycmVudExldmVsLnRlbXBsYXRlcywgdGhpcy5lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpc3BPYmogPSAobW9iQm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgYXMgTW9iO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB4ID0gdGhpcy54ICsgKE1hdGgucmFuZG9tKCkgKiB0aGlzLmFyZWEpIC0gKHRoaXMuYXJlYSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSB0aGlzLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgbW9iQm9keS5wb3NpdGlvbiA9IFt4LCB5XTtcclxuICAgICAgICAgICAgICAgIHdwMi5hZGRCb2R5KG1vYkJvZHkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc3BPYmoucG9zaXRpb24uc2V0KHgsIHkpO1xyXG4gICAgICAgICAgICAgICAgZGlzcE9iai52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBkaXNwT2JqLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLmFkZENoaWxkKGRpc3BPYmopO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsb2FkU3ByID0gbmV3IEFuaW1hdGVkU3ByaXRlKCk7XHJcbiAgICAgICAgICAgICAgICBsb2FkU3ByLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwibG9hZFwiLCBcImFzc2V0cy9pbWcvZWZmZWN0cy9sb2FkLnBuZ1wiLCBbMCwgMSwgMiwgM10sIDY0LCA2NCkpO1xyXG4gICAgICAgICAgICAgICAgbG9hZFNwci5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgICAgICBsb2FkU3ByLnBvc2l0aW9uLnNldCh4LCB5ICsgMTApO1xyXG4gICAgICAgICAgICAgICAgbG9hZFNwci5wbGF5KFwibG9hZFwiLCA0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIC8vbG9hZFNwci5zY2FsZS5zZXQoMSwgLTEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lci5hZGRDaGlsZChsb2FkU3ByKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLnJlbW92ZUNoaWxkKGxvYWRTcHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BPYmouaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcE9iai52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sIDMwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIChkaXNwT2JqIGFzIE1vYikub25EZWF0aCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1vYiBkaWVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9iQ291bnQtLTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vYkNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRTcGF3biA9IChwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDApICsgdGhpcy5yZXNwYXduU2Vjb25kcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCAqIGFzIHAyIGZyb20gXCJwMlwiO1xyXG5pbXBvcnQgeyBDT0xfR1JQX1BMQVlFUiwgQ09MX0dSUF9CVUxMRVQsIENPTF9HUlBfU0NFTkUsIENPTF9HUlBfR1JPVU5EIH0gZnJvbSAnLi4vd29ybGQvQ29sbGlzaW9uR3JvdXBzJztcclxuaW1wb3J0IHsgd3AyIH0gZnJvbSAnLi4vd29ybGQvV29ybGRQMic7XHJcbmltcG9ydCB7IEdsb2JhbCB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4uL19lbmdpbmUnO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZm9yIGJ1bGxldHMsIGRlY2FscyBldGMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnVsbGV0IGV4dGVuZHMgUElYSS5TcHJpdGUge1xyXG4gICAgcHJpdmF0ZSBkaXJlY3Rpb246IFBJWEkuUG9pbnQgPSBuZXcgUElYSS5Qb2ludCgpO1xyXG4gICAgcHJpdmF0ZSB0dGw6IG51bWJlcjtcclxuICAgIHByaXZhdGUgc3RhcnRUaW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGlzRGVhZDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgb25EZWF0aDogKCkgPT4gdm9pZDtcclxuXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJhY3Rpb25UeXBlOiBudW1iZXIgPSA2NjY7XHJcbiAgICBwdWJsaWMgYm9keTogcDIuQm9keTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgYnVsbGV0IHBhcnRpY2xlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB0ZXh0dXJlXHJcbiAgICAgKiBAcGFyYW0gdmVsb2NpdHkgaW4gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgICAqIEBwYXJhbSB0dGwgdGltZSB0byBsaXZlIGluIHNlY29uZHNcclxuICAgICAqIEBwYXJhbSBkYW1hZ2UgYnVsbGV0IGhpdCBkYW1hZ2VcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IodGV4dHVyZTogUElYSS5UZXh0dXJlLCBwdWJsaWMgdmVsb2NpdHk6IG51bWJlciwgdHRsOiBudW1iZXIsIHB1YmxpYyBkYW1hZ2U6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHRleHR1cmUpO1xyXG4gICAgICAgIHRoaXMudHRsID0gdHRsO1xyXG4gICAgICAgIHRoaXMuSXNEZWFkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBEaXJlY3Rpb24oZGlyZWN0aW9uOiBQSVhJLlBvaW50KSB7XHJcbiAgICAgICAgLy8gIG5vcm1hbGl6ZSBtb3ZlbWVudCB2ZWN0b3JcclxuICAgICAgICBsZXQgbGVuID0gZGlyZWN0aW9uLnggKiBkaXJlY3Rpb24ueCArIGRpcmVjdGlvbi55ICogZGlyZWN0aW9uLnk7XHJcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uLnNldChkaXJlY3Rpb24ueCAqIGxlbiwgZGlyZWN0aW9uLnkgKiBsZW4pO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCBEaXJlY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgSXNEZWFkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzRGVhZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgSXNEZWFkKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlICE9IHRoaXMuaXNEZWFkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEZWFkID0gdmFsdWU7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJidWxsZXQgaXMgZGVhZDogXCIgKyB2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyAgaWYgc2V0IHRvIGFsaXZlIHJlbWVtYmVyIHN0YXJ0IHRpbWVcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5ID0gWzAsIDBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2R5LnBvc2l0aW9uID0gW3RoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gIGZpcmUgT25EZWF0aCBpZiBuZWVkZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEZWFkICYmIHRoaXMub25EZWF0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRlYXRoKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9ICF0aGlzLmlzRGVhZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBPbkRlYXRoKGNiOiB7ICgpOiB2b2lkIH0pIHtcclxuICAgICAgICB0aGlzLm9uRGVhdGggPSBjYjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgT25EZWF0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vbkRlYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgICAvLyBUVEwgZXhwaXJ5XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzRGVhZCkge1xyXG4gICAgICAgICAgICBsZXQgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xyXG4gICAgICAgICAgICBsZXQgZWxsYXBzZWQgPSBub3cgLSB0aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICAgICAgdGhpcy5Jc0RlYWQgPSB0aGlzLnR0bCA8IGVsbGFwc2VkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBidWxsZXRzOiBCdWxsZXRbXSA9IFtdO1xyXG4gICAgcHVibGljIHN0YXRpYyBlbWl0QnVsbGV0ID0gKHRleHR1cmVOYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBQSVhJLlBvaW50LCB0YXJnZXQ6YW55LCBkYW1hZ2U6IG51bWJlcik6IEJ1bGxldCA9PiB7XHJcbiAgICAgICAgbGV0IGJ1bGxldCA9IEJ1bGxldC5maW5kRGVhZEJ1bGxldCgpO1xyXG4gICAgICAgIGlmICghYnVsbGV0KSB7XHJcblxyXG4gICAgICAgICAgICAvLyAgY3JlYXRlIG5ldyBidWxsZXRcclxuICAgICAgICAgICAgdmFyIHQgPSBUZXh0dXJlTG9hZGVyLkdldCh0ZXh0dXJlTmFtZSk7XHJcbiAgICAgICAgICAgIGJ1bGxldCA9IG5ldyBCdWxsZXQodCwgMjAwLCA1LCBkYW1hZ2UpO1xyXG4gICAgICAgICAgICBidWxsZXQuYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgICAgICBidWxsZXQuc2NhbGUuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIEJ1bGxldC5idWxsZXRzLnB1c2goYnVsbGV0KTtcclxuICAgICAgICAgICAgR2xvYmFsLndvcmxkQ29udGFpbmVyLmFkZENoaWxkKGJ1bGxldCk7XHJcblxyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIC8vICBjcmVhdGUgYm9keSAoc2Vuc29yIHNoYXBlKVxyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGxldCBzaGFwZSA9IG5ldyBwMi5DaXJjbGUoeyByYWRpdXM6IGJ1bGxldC53aWR0aCAvIDIgfSk7XHJcbiAgICAgICAgICAgIHNoYXBlLmNvbGxpc2lvbkdyb3VwID0gQ09MX0dSUF9CVUxMRVQ7XHJcbiAgICAgICAgICAgIHNoYXBlLmNvbGxpc2lvbk1hc2sgPSBDT0xfR1JQX1BMQVlFUiB8IENPTF9HUlBfU0NFTkUgfCBDT0xfR1JQX0dST1VORDtcclxuICAgICAgICAgICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIG9wdGlvbnM6IHAyLkJvZHlPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0sXHJcbiAgICAgICAgICAgICAgICBhbmdsZTogMCxcclxuICAgICAgICAgICAgICAgIGZpeGVkUm90YXRpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYW5ndWxhckRhbXBpbmc6IDAsXHJcbiAgICAgICAgICAgICAgICBkYW1waW5nOiAwXHJcbiAgICAgICAgICAgIH0gYXMgcDIuQm9keU9wdGlvbnM7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gbmV3IHAyLkJvZHkob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGJvZHkuYWRkU2hhcGUoc2hhcGUpO1xyXG4gICAgICAgICAgICBib2R5LnNldERlbnNpdHkoMC4wKTtcclxuICAgICAgICAgICAgYm9keS5ncmF2aXR5U2NhbGUgPSAwO1xyXG4gICAgICAgICAgICBib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IDI7XHJcbiAgICAgICAgICAgIGJvZHkuY29sbGlzaW9uUmVzcG9uc2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgYm9keS50eXBlID0gcDIuQm9keS5EWU5BTUlDO1xyXG4gICAgICAgICAgICAoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgPSBidWxsZXQ7XHJcbiAgICAgICAgICAgIGJ1bGxldC5ib2R5ID0gYm9keTtcclxuICAgICAgICAgICAgd3AyLmFkZEJvZHkoYm9keSk7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgYnVsbGV0LnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICAgICAgbGV0IHB0ID0gKHRhcmdldCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkgPyBuZXcgUElYSS5Qb2ludCh0YXJnZXRbMF0gLSBwb3NpdGlvbi54LCB0YXJnZXRbMV0gLSBwb3NpdGlvbi55KSA6IG5ldyBQSVhJLlBvaW50KHRhcmdldC54IC0gcG9zaXRpb24ueCwgdGFyZ2V0LnkgLSBwb3NpdGlvbi55KTtcclxuICAgICAgICBidWxsZXQuRGlyZWN0aW9uID0gcHQ7XHJcbiAgICAgICAgYnVsbGV0LmRhbWFnZSA9IGRhbWFnZTtcclxuICAgICAgICBidWxsZXQuSXNEZWFkID0gZmFsc2U7XHJcbiAgICAgICAgYnVsbGV0LmJvZHkudmVsb2NpdHlbMF0gPSBidWxsZXQuRGlyZWN0aW9uLnggKiBidWxsZXQudmVsb2NpdHk7XHJcbiAgICAgICAgYnVsbGV0LmJvZHkudmVsb2NpdHlbMV0gPSBidWxsZXQuRGlyZWN0aW9uLnkgKiBidWxsZXQudmVsb2NpdHk7XHJcblxyXG4gICAgICAgIHJldHVybiBidWxsZXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVzZXQoKXtcclxuICAgICAgICBCdWxsZXQuYnVsbGV0cyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmREZWFkQnVsbGV0ID0gKCk6IEJ1bGxldCA9PiB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IEJ1bGxldC5idWxsZXRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBibHQgPSBCdWxsZXQuYnVsbGV0c1tpXTtcclxuICAgICAgICAgICAgaWYgKGJsdC5Jc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBibHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4uJztcclxuXHJcbmNvbnN0IFRFWFRVUkVfQlVNUEVSID0gXCJhc3NldHMvb2JqZWN0cy1hdGxhcy5qc29uQGJ1bXBlcl8wMS5wbmdcIjtcclxuY29uc3QgVEVYVFVSRV9ST1RPUiA9ICBcImFzc2V0cy9vYmplY3RzLWF0bGFzLmpzb25AYnVtcGVyX3JvdG9yXzAxLnBuZ1wiO1xyXG5jb25zdCBST1RBVElPTiA9IE1hdGguUEkgLyA4O1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1bXBlciBleHRlbmRzIFBJWEkuU3ByaXRlIHtcclxuICAgIHByaXZhdGUgcm90b3I6IFBJWEkuU3ByaXRlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKFRleHR1cmVMb2FkZXIuR2V0KFRFWFRVUkVfQlVNUEVSKS8qUElYSS5sb2FkZXIucmVzb3VyY2VzW1RFWFRVUkVfQlVNUEVSXS50ZXh0dXJlKi8pO1xyXG4gICAgICAgIHRoaXMucm90b3IgPSBuZXcgUElYSS5TcHJpdGUoVGV4dHVyZUxvYWRlci5HZXQoVEVYVFVSRV9ST1RPUikvKlBJWEkubG9hZGVyLnJlc291cmNlc1tURVhUVVJFX1JPVE9SXS50ZXh0dXJlKi8pO1xyXG4gICAgICAgIHRoaXMucm90b3IuYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgIHRoaXMucm90b3IucGl2b3Quc2V0KDAuNSk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnJvdG9yKTtcclxuICAgICAgICB0aGlzLmFuY2hvci5zZXQoMC41KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25VcGRhdGUgPSAoZHQ6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHZhciByb3QgPSB0aGlzLnJvdG9yLnJvdGF0aW9uIC0gKFJPVEFUSU9OICogZHQgLyAxMDAwKTtcclxuICAgICAgICB0aGlzLnJvdG9yLnJvdGF0aW9uID0gcm90ICUgTWF0aC5QSTtcclxuICAgIH07XHJcbn0iLCJpbXBvcnQgKiBhcyBwYXJ0aWNsZXMgZnJvbSBcInBpeGktcGFydGljbGVzXCI7XHJcbmltcG9ydCAqIGFzIFRXRUVOIGZyb20gXCJAdHdlZW5qcy90d2Vlbi5qc1wiO1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlUGFydGljbGVFbWl0dGVyIH0gZnJvbSAnLi4vZ2xvYmFsJztcclxuaW1wb3J0IHsgQU5JTUFUSU9OX0ZQU19TTE9XLCBBTklNQVRJT05fRlBTX05PUk1BTCB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgTU9WRV9UT1BJQywgR1JPVU5EX1NIQUtFLCBldmVudEVtaXR0ZXIgfSBmcm9tICcuLi9ldmVudHMnO1xyXG5pbXBvcnQgeyBBbmltYXRlZFNwcml0ZSwgQW5pbWF0aW9uU2VxdWVuY2UsIEdsb2JhbCB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgTW92ZW1lbnRDb250cm9sbGVyLCBNb3ZlbWVudFN0YXRlIH0gZnJvbSAnLi9Nb3ZlbWVudENvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyB3cDIgfSBmcm9tICcuLi93b3JsZC9Xb3JsZFAyJztcclxuaW1wb3J0IHsgc3RhdHMgfSBmcm9tICcuL1BsYXllclN0YXRzJztcclxuaW1wb3J0IHsgTW9iIH0gZnJvbSAnLi4vbW9icy9Nb2InO1xyXG5pbXBvcnQgeyBMZXZlbExvYWRlciB9IGZyb20gJy4uL3dvcmxkL0xldmVsTG9hZGVyJztcclxuaW1wb3J0IHsgSUludGVyYWN0aW9uVHlwZSB9IGZyb20gJy4uL3dvcmxkL0xldmVsSW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IHNuZCB9IGZyb20gJy4uL3dvcmxkL1NvdW5kTWFuJztcclxuaW1wb3J0IHsgQnVsbGV0IH0gZnJvbSAnLi9CdWxsZXQnO1xyXG5pbXBvcnQgeyBTdGF0VHlwZSwgQXRyVHlwZSB9IGZyb20gJy4uL2VudW1zJztcclxuXHJcbmNvbnN0IEhFUk9fRlJBTUVfU0laRTogbnVtYmVyID0gNjQ7XHJcblxyXG5leHBvcnQgY2xhc3MgSGVyb0NoYXJhY3RlciBleHRlbmRzIEFuaW1hdGVkU3ByaXRlIHtcclxuICAgIHByaXZhdGUgZW1pdHRlclBpeGllczogcGFydGljbGVzLkVtaXR0ZXI7XHJcbiAgICBwcml2YXRlIGVtaXR0ZXJCdXJuOiBwYXJ0aWNsZXMuRW1pdHRlcjtcclxuICAgIHByaXZhdGUgbW92ZW1lbnRDdHJsOiBNb3ZlbWVudENvbnRyb2xsZXI7XHJcbiAgICBwcml2YXRlIGlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjb250YWluZXI6IFBJWEkuQ29udGFpbmVyKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1vdmVtZW50Q3RybCA9IG5ldyBNb3ZlbWVudENvbnRyb2xsZXIod3AyKTtcclxuICAgICAgICB3cDIub24oXCJwbGF5ZXJDb250YWN0XCIsIHRoaXMub25QbGF5ZXJDb250YWN0LCB0aGlzKTtcclxuICAgICAgICB3cDIub24oXCJidWxsZXRDb250YWN0XCIsIHRoaXMub25CdWxsZXRDb250YWN0LCB0aGlzKTtcclxuXHJcbiAgICAgICAgdmFyIGNmZyA9IHsgICAgIFxyXG4gICAgICAgICAgICBhbHBoYToge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IDAuNyxcclxuICAgICAgICAgICAgICAgIGVuZDogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBibGVuZE1vZGU6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICAgIGZyZXF1ZW5jeTogMC4wMSxcclxuICAgICAgICAgICAgc3RhcnRSb3RhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWluOiAyNjUsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDI3NVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb2xvcjoge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgICAgICAgICAgZW5kOiBcIiNmZjUwNTBcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzcGVlZDoge1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IDEsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1pbmltdW1TcGVlZE11bHRpcGxpZXI6IDFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NhbGU6IHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiAwLjIsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IDAuNlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtYXhQYXJ0aWNsZXM6IDIwLFxyXG4gICAgICAgICAgICBsaWZldGltZToge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgbWF4OiAwLjc1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNwYXduVHlwZTogXCJjaXJjbGVcIixcclxuICAgICAgICAgICAgc3Bhd25DaXJjbGU6IHtcclxuICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICB5OiBIRVJPX0ZSQU1FX1NJWkUtMjUsXHJcbiAgICAgICAgICAgICAgICByOiAyNVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyAgICBhdHRhY2hlZCB0byBoZXJvIHNwcml0ZVxyXG4gICAgICAgIHRoaXMuZW1pdHRlckJ1cm4gPSBjcmVhdGVQYXJ0aWNsZUVtaXR0ZXIodGhpcywgW1BJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoXCJhc3NldHMvaW1nL2VmZmVjdHMvZmxhbWUucG5nXCIpXSwgY2ZnKTsgIFxyXG4gICAgICAgIC8vICAgYXR0YWNoZWQgdG8gY29udGFpbmVyIHNpbmNlIGl0IG11c3QgZW1pdCBvdXRzaWRlIGhlcm8gc3ByaXRlXHJcbiAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzID0gY3JlYXRlUGFydGljbGVFbWl0dGVyKGNvbnRhaW5lciwgW1BJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoXCJhc3NldHMvc3Rhci5wbmdcIildKTsgIFxyXG5cclxuICAgICAgICBjb25zdCBhc3NldCA9IFwiYXNzZXRzL2hlcm8ucG5nXCI7XHJcbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcInJpZ2h0XCIsIGFzc2V0LCBbMTgsIDE5LCAyMCwgMjEsIDIyLCAyM10sIEhFUk9fRlJBTUVfU0laRSwgSEVST19GUkFNRV9TSVpFKSk7XHJcbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcImxlZnRcIiwgYXNzZXQsIFsxMiwgMTMsIDE0LCAxNSwgMTYsIDE3XSwgSEVST19GUkFNRV9TSVpFLCBIRVJPX0ZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwianVtcGxlZnRcIiwgYXNzZXQsIFsyNCwgMjUsIDI2LCAyNywgMjgsIDI5XSwgSEVST19GUkFNRV9TSVpFLCBIRVJPX0ZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwianVtcHJpZ2h0XCIsIGFzc2V0LCBbMzAsIDMxLCAzMiwgMzMsIDM0LCAzNV0sIEhFUk9fRlJBTUVfU0laRSwgSEVST19GUkFNRV9TSVpFKSk7XHJcbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcImp1bXB1cFwiLCBhc3NldCwgWzEsIDMsIDQsIDZdLCBIRVJPX0ZSQU1FX1NJWkUsIEhFUk9fRlJBTUVfU0laRSkpO1xyXG4gICAgICAgIHRoaXMuYWRkQW5pbWF0aW9ucyhuZXcgQW5pbWF0aW9uU2VxdWVuY2UoXCJpZGxlXCIsIGFzc2V0LCBbMSwgMSwgMCwgMSwgMiwgMywgLCA0LCA1LCAxMywgMTIsIDYsIDcsIDExLCAxOCwgMTksIDBdLCBIRVJPX0ZSQU1FX1NJWkUsIEhFUk9fRlJBTUVfU0laRSkpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwianVtcGRvd25sZWZ0XCIsIGFzc2V0LCBbMzYsIDM3LCAzOF0sIEhFUk9fRlJBTUVfU0laRSwgSEVST19GUkFNRV9TSVpFKSk7XHJcbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcImp1bXBkb3ducmlnaHRcIiwgYXNzZXQsIFszOSwgNDAsIDQxXSwgSEVST19GUkFNRV9TSVpFLCBIRVJPX0ZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFkZEFuaW1hdGlvbnMobmV3IEFuaW1hdGlvblNlcXVlbmNlKFwianVtcGRvd25cIiwgYXNzZXQsIFs0MiwgNDMsIDQ0XSwgSEVST19GUkFNRV9TSVpFLCBIRVJPX0ZSQU1FX1NJWkUpKTtcclxuICAgICAgICB0aGlzLmFuY2hvci5zZXQoMC41LCAwLjU4KTtcclxuXHJcbiAgICAgICAgZXZlbnRFbWl0dGVyLm9uKE1PVkVfVE9QSUMsIHRoaXMub25QbGF5ZXJNb3ZlKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBpZiB0aGUgcGxheWVyIGNhbiBpbnRlcmFjdCB2aWEgY29udHJvbHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgSXNJbnRlcmFjdGl2ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlbWVudEN0cmwuaXNJbnRlcmFjdGl2ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGlmIHRoZSBwbGF5ZXIgY2FuIGludGVyYWN0IHZpYSBjb250cm9scy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldCBJc0ludGVyYWN0aXZlKG5ld1ZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudEN0cmwuaXNJbnRlcmFjdGl2ZSA9IG5ld1ZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgbW92ZW1lbnRDdHJsLk1vdmVtZW50U3RhdGUgYW5kIHVwZGF0ZXMgcGl4aSBkdXN0IGVtaXR0ZXIgYW5kIGNvbnN1bXB0aW9uLlxyXG4gICAgICogQHBhcmFtIGR0IGVsYXBzZWQgdGltZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uVXBkYXRlID0gKGR0OiBudW1iZXIpID0+IHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBHbG9iYWwucG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBHbG9iYWwucG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuSXNJbnRlcmFjdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVtZW50Q3RybC51cGRhdGUoZHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVtZW50Q3RybC5Nb3ZlbWVudFN0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5JZGxlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzLmVtaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuTGVmdDpcclxuICAgICAgICAgICAgY2FzZSBNb3ZlbWVudFN0YXRlLkp1bXBMZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzLmVtaXQgPSB0aGlzLm1vdmVtZW50Q3RybC5Jc1J1bm5pbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXR0ZXJQaXhpZXMubWluU3RhcnRSb3RhdGlvbiA9IC0yNTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlclBpeGllcy5tYXhTdGFydFJvdGF0aW9uID0gMjU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3ZlbWVudFN0YXRlLlJpZ2h0OlxyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcFJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzLmVtaXQgPSB0aGlzLm1vdmVtZW50Q3RybC5Jc1J1bm5pbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXR0ZXJQaXhpZXMubWluU3RhcnRSb3RhdGlvbiA9IDE1NTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlclBpeGllcy5tYXhTdGFydFJvdGF0aW9uID0gMjA1O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcFVwOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzLmVtaXQgPSB0aGlzLm1vdmVtZW50Q3RybC5Jc1J1bm5pbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXR0ZXJQaXhpZXMubWluU3RhcnRSb3RhdGlvbiA9IDI0NTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlclBpeGllcy5tYXhTdGFydFJvdGF0aW9uID0gMjk1O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW1pdHRlclBpeGllcy51cGRhdGUoZHQgKiAwLjAwMSk7XHJcbiAgICAgICAgdGhpcy5lbWl0dGVyUGl4aWVzLnVwZGF0ZU93bmVyUG9zKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICB0aGlzLmVtaXR0ZXJCdXJuLnVwZGF0ZShkdCAqIDAuMDAxKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBjaGVjayBpZiBydW5uaW5nXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIGlmICh0aGlzLm1vdmVtZW50Q3RybC5Jc1J1bm5pbmcgJiYgdGhpcy5tb3ZlbWVudEN0cmwuTW92ZW1lbnRTdGF0ZSAhPT0gTW92ZW1lbnRTdGF0ZS5JZGxlKSB7XHJcbiAgICAgICAgICAgIHN0YXRzLmluY3JlYXNlU3RhdChTdGF0VHlwZS5EdXN0LCAtZHQgKiAwLjAwNSk7ICAgLy8gIDUvc2VjXHJcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IDg7XHJcbiAgICAgICAgICAgIGxldCBkZWdyZWUgPSBNYXRoLlBJICogYW5nbGUgLyAxODA7XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSAodGhpcy5tb3ZlbWVudEN0cmwuTW92ZW1lbnRTdGF0ZSA9PT0gTW92ZW1lbnRTdGF0ZS5MZWZ0KSA/IGRlZ3JlZSA6IC1kZWdyZWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW1pdHRlckJ1cm4uZW1pdCA9IHN0YXRzLmlzQnVybmluZztcclxuICAgICAgICBzdXBlci5vblVwZGF0ZShkdCk7ICAgICAgICBcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBvblBsYXllck1vdmUgPSAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIHZhciBzdGF0ZTogTW92ZW1lbnRTdGF0ZSA9IGV2ZW50Lm5ld1N0YXRlIGFzIE1vdmVtZW50U3RhdGU7XHJcbiAgICAgICAgdmFyIGZwcyA9IGV2ZW50LmlzUnVubmluZyA/IEFOSU1BVElPTl9GUFNfTk9STUFMICogMS42IDogQU5JTUFUSU9OX0ZQU19OT1JNQUw7XHJcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSWRsZTpcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuaWRsZUFuaW1hdGlvblRpbWVvdXRIYW5kbGUpIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaWRsZUFuaW1hdGlvblRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoXCJpZGxlXCIsIEFOSU1BVElPTl9GUFNfU0xPVyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc25kLmlkbGUoKTtcclxuICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3ZlbWVudFN0YXRlLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZGxlQW5pbWF0aW9uVGltZW91dEhhbmRsZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoXCJsZWZ0XCIsIGZwcyk7XHJcbiAgICAgICAgICAgICAgICBzbmQud2FsayhldmVudC5pc1J1bm5pbmcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5SaWdodDpcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheShcInJpZ2h0XCIsIGZwcyk7XHJcbiAgICAgICAgICAgICAgICBzbmQud2FsayhldmVudC5pc1J1bm5pbmcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5KdW1wTGVmdDpcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheShcImp1bXBsZWZ0XCIsIGZwcyk7XHJcbiAgICAgICAgICAgICAgICBzbmQuanVtcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5KdW1wUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZGxlQW5pbWF0aW9uVGltZW91dEhhbmRsZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoXCJqdW1wcmlnaHRcIiwgZnBzKTtcclxuICAgICAgICAgICAgICAgIHNuZC5qdW1wKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBNb3ZlbWVudFN0YXRlLkp1bXBVcDpcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheShcImp1bXB1cFwiLCBmcHMpO1xyXG4gICAgICAgICAgICAgICAgc25kLmp1bXAoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcERvd25MZWZ0OlxyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWRsZUFuaW1hdGlvblRpbWVvdXRIYW5kbGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KFwianVtcGRvd25sZWZ0XCIsIGZwcywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgc25kLmp1bXBBdHRhY2soKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcERvd25SaWdodDpcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheShcImp1bXBkb3ducmlnaHRcIiwgZnBzLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBzbmQuanVtcEF0dGFjaygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5KdW1wRG93bjpcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkbGVBbmltYXRpb25UaW1lb3V0SGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheShcImp1bXBkb3duXCIsIGZwcywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgc25kLmp1bXBBdHRhY2soKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgcGxheWVyIGhhcyBqdW1wZWQgb24gc29tZXRoaW5nIHdpdGggYSBoaWdoIHZlbG9jaXR5LlxyXG4gICAgICogQWRkcyBzbW9rZSBmb3IgZ3JvdW5kIGNvbnRhY3RzIGFuZCBoYW5kbGVzIG1vYiBjb2xsaXNpb24gZm9yIG5wYydzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG9uUGxheWVyQ29udGFjdChldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgU05EX1RSRVNIT0xEX1ZFTE9DSVRZOiBudW1iZXIgPSA0MDA7XHJcbiAgICAgICAgY29uc3QgU01PS0VfVkVMT0NJVFk6IG51bWJlciA9IDQ1MDtcclxuICAgICAgICBjb25zdCBBVFRBQ0tfVkVMT0NJVFk6IG51bWJlciA9IDU1MDtcclxuXHJcbiAgICAgICAgbGV0IGJvZHk6IHAyLkJvZHkgPSBldmVudC5ib2R5IGFzIHAyLkJvZHk7XHJcbiAgICAgICAgdmFyIG1vYjogTW9iID0gZXZlbnQuYm9keS5EaXNwbGF5T2JqZWN0IGFzIE1vYjtcclxuXHJcbiAgICAgICAgbGV0IHZlcnRpY2FsVmVsb2NpdHkgPSBNYXRoLmFicyhldmVudC52ZWxvY2l0eVsxXSk7XHJcbiAgICAgICBcclxuICAgICAgICBpZiAodmVydGljYWxWZWxvY2l0eSA+IEFUVEFDS19WRUxPQ0lUWSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiVmVydCB2ZWxvY2l0eTogXCIgKyB2ZXJ0aWNhbFZlbG9jaXR5KTtcclxuICAgICAgICAgICAgLy8gIGNoZWNrIGNvbGxpc2lvbiB2cyBtb2JzXHJcbiAgICAgICAgICAgIGlmIChtb2IgaW5zdGFuY2VvZiBNb2IpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbW9iLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTW9iSW50ZXJhY3Rpb24obW9iLCBib2R5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG1vdmVtZW50U3RhdGUgPSB0aGlzLm1vdmVtZW50Q3RybC5Nb3ZlbWVudFN0YXRlO1xyXG4gICAgICAgICAgICBpZiAobW92ZW1lbnRTdGF0ZSA9PT0gTW92ZW1lbnRTdGF0ZS5KdW1wRG93biB8fCBcclxuICAgICAgICAgICAgICAgIG1vdmVtZW50U3RhdGUgPT09IE1vdmVtZW50U3RhdGUuSnVtcERvd25MZWZ0IHx8XHJcbiAgICAgICAgICAgICAgICBtb3ZlbWVudFN0YXRlID09PSBNb3ZlbWVudFN0YXRlLkp1bXBEb3duUmlnaHRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBzbmQuanVtcENvbnRhY3QoKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KEdST1VORF9TSEFLRSwge21pbGxpU2Vjb25kczogNjAwLCBtYWduaXR1ZGVJblBpeGVsczogOX0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICBpZiAodmVydGljYWxWZWxvY2l0eSA+IFNNT0tFX1ZFTE9DSVRZKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVmVydCB2ZWxvY2l0eTogXCIgKyB2ZXJ0aWNhbFZlbG9jaXR5KTtcclxuICAgICAgICAgICAgdmFyIHNtb2tlOiBBbmltYXRlZFNwcml0ZSA9IG5ldyBBbmltYXRlZFNwcml0ZSgpO1xyXG4gICAgICAgICAgICBzbW9rZS5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcInNtb2tlXCIsIFwiYXNzZXRzL2ltZy9lZmZlY3RzL2p1bXBfc21va2UucG5nXCIsXHJcbiAgICAgICAgICAgICAgICBbMCwgMSwgMiwgMywgNCwgNV0sIEhFUk9fRlJBTUVfU0laRSwgSEVST19GUkFNRV9TSVpFKSk7XHJcbiAgICAgICAgICAgIHNtb2tlLmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgc21va2UucGl2b3Quc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIHNtb2tlLnggPSB0aGlzLng7XHJcbiAgICAgICAgICAgIHNtb2tlLnkgPSB0aGlzLnkgLSAyNTtcclxuICAgICAgICAgICAgc21va2UuYWxwaGEgPSAwLjc7XHJcbiAgICAgICAgICAgIHNtb2tlLnJvdGF0aW9uID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZENoaWxkKHNtb2tlKTtcclxuICAgICAgICAgICAgc21va2Uub25Db21wbGV0ZSA9ICgpID0+IHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHNtb2tlKTtcclxuICAgICAgICAgICAgc21va2UucGxheShcInNtb2tlXCIsIDYsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYodmVydGljYWxWZWxvY2l0eSA+IFNORF9UUkVTSE9MRF9WRUxPQ0lUWSl7XHJcbiAgICAgICAgICAgIHNuZC5qdW1wQ29udGFjdCgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInZlbG9jaXR5OiBcIiArIGV2ZW50LnZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGJ1bGxldHMgaGl0dGluZyB0aGUgcGxheWVyIG9yIG9ic3RhY2xlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG9uQnVsbGV0Q29udGFjdChldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGJ1bGxldDogQnVsbGV0ID0gZXZlbnQuYnVsbGV0Qm9keS5EaXNwbGF5T2JqZWN0IGFzIEJ1bGxldDtcclxuICAgICAgICBpZiAoIWJ1bGxldC5Jc0RlYWQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnBsYXllckhpdCkge1xyXG4gICAgICAgICAgICAgICAgc25kLmhpdFBhaW4oKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5odWQuYWRkSW5mb01lc3NhZ2UodGhpcy5wb3NpdGlvbiwgYCR7LWJ1bGxldC5kYW1hZ2V9IEhQYCwgTVNHX0hQX1NUWUxFLCA1MCk7XHJcbiAgICAgICAgICAgICAgICBzdGF0cy5pbmNyZWFzZVN0YXQoU3RhdFR5cGUuSFAsIC1idWxsZXQuZGFtYWdlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgVE9ETzogcmVjeWNsZSBleHBsb2RlIGFuaW1hdGlvbnNcclxuICAgICAgICAgICAgICAgIHZhciBleHBsb2RlOiBBbmltYXRlZFNwcml0ZSA9IG5ldyBBbmltYXRlZFNwcml0ZSgpO1xyXG4gICAgICAgICAgICAgICAgZXhwbG9kZS5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcImV4cFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltZy9lZmZlY3RzL3NsaW1lX2F0a19leHAucG5nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgWzAsIDEsIDIsIDMsIDQsIDVdLCAzMiwgMzIpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgZXhwbG9kZS5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgICAgICBleHBsb2RlLnBpdm90LnNldCgwLjUpO1xyXG4gICAgICAgICAgICAgICAgZXhwbG9kZS54ID0gYnVsbGV0Lng7XHJcbiAgICAgICAgICAgICAgICBleHBsb2RlLnkgPSBidWxsZXQueTtcclxuICAgICAgICAgICAgICAgIGV4cGxvZGUuYWxwaGEgPSAwLjc7XHJcbiAgICAgICAgICAgICAgICBleHBsb2RlLnJvdGF0aW9uID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZChleHBsb2RlKTtcclxuICAgICAgICAgICAgICAgIGV4cGxvZGUub25Db21wbGV0ZSA9ICgpID0+IHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKGV4cGxvZGUpO1xyXG4gICAgICAgICAgICAgICAgZXhwbG9kZS5wbGF5KFwiZXhwXCIsIDEwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBzbmQuYnVsbGV0SGl0V2FsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1bGxldC5Jc0RlYWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgaW50ZXJhY3Rpb24gd2l0aCBtb2JzIChtb2Iga2lsbCkuXHJcbiAgICAgKiBAcGFyYW0gbW9iXHJcbiAgICAgKiBAcGFyYW0gYm9keVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhhbmRsZU1vYkludGVyYWN0aW9uKG1vYjogTW9iLCBib2R5OiBwMi5Cb2R5KSB7XHJcbiAgICAgICAgbGV0IGRpc3BPYmogPSAoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgYXMgUElYSS5EaXNwbGF5T2JqZWN0O1xyXG4gICAgICAgIGxldCBpdCA9IGRpc3BPYmogYXMgSUludGVyYWN0aW9uVHlwZTtcclxuXHJcbiAgICAgICAgLy8gIGdlbmVyYXRlIGRyb3BcclxuICAgICAgICBpZiAoaXQuZHJvcCkge1xyXG4gICAgICAgICAgICBsZXQgaXNEcm9wcGluZyA9IE1hdGgucmFuZG9tKCkgPD0gaXQuZHJvcC5jaGFuY2U7XHJcbiAgICAgICAgICAgIGlmIChpc0Ryb3BwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHJvcEl0ZW1Cb2R5ID0gTGV2ZWxMb2FkZXIuY3JlYXRlRW50aXR5KHN0YXRzLmN1cnJlbnRMZXZlbC50ZW1wbGF0ZXMsIGl0LmRyb3AuZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRHJvcEl0ZW0obW9iLCBkcm9wSXRlbUJvZHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVFbnRpdHkoYm9keSk7XHJcbiAgICAgICAgbW9iLnNxdWlzaCgoKSA9PiB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZChkaXNwT2JqKSk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vICBhZGQgZXhwICAgICAgIFxyXG4gICAgICAgIHZhciBleHAgPSBtb2IuYXR0cmlidXRlc1tBdHJUeXBlLkhQXSAvIDI7XHJcbiAgICAgICAgc3RhdHMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLlRvdGFsRXhwLCBleHApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBkcm9wIGl0ZW0gdG8gdGhlIHNjZW5lIHdpdGggYSB0d2VlbiBhbmltYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gZGlzcE9ialxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFkZERyb3BJdGVtKG1vYjogTW9iLCBpdGVtQm9keTogcDIuQm9keSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBkaXNwT2JqID0gKGl0ZW1Cb2R5IGFzIGFueSkuRGlzcGxheU9iamVjdCBhcyBQSVhJLkRpc3BsYXlPYmplY3Q7XHJcbiAgICAgICAgZGlzcE9iai54ID0gbW9iLng7XHJcbiAgICAgICAgZGlzcE9iai55ID0gbW9iLnkgKyA0MDtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZChkaXNwT2JqKTtcclxuXHJcbiAgICAgICAgLy8gIHR3ZWVuIGZyb20gbW9iIHBvc2l0aW9uIHRvIHJhbmRvbSBwb3NpdGlvbiBuZWFyIGhlcm9cclxuICAgICAgICB2YXIgdXBYID0gZGlzcE9iai5wb3NpdGlvbi54ICsgNzU7XHJcbiAgICAgICAgdmFyIHVwWSA9IGRpc3BPYmoucG9zaXRpb24ueSArIDIwMDtcclxuICAgICAgICB2YXIgbW92ZVVwID0gbmV3IFRXRUVOLlR3ZWVuKGRpc3BPYmoucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7IHg6IHVwWCwgeTogdXBZIH0sIDQwMClcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbUJvZHkucG9zaXRpb24gPSBbZGlzcE9iai5wb3NpdGlvbi54LCBkaXNwT2JqLnBvc2l0aW9uLnldO1xyXG4gICAgICAgICAgICAgICAgd3AyLmFkZEJvZHkoaXRlbUJvZHkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIHZhciBvcmdTY2FsZVggPSBkaXNwT2JqLnNjYWxlLng7XHJcbiAgICAgICAgdmFyIG9yZ1NjYWxlWSA9IGRpc3BPYmouc2NhbGUueTtcclxuICAgICAgICB2YXIgc2NhbGUgPSBuZXcgVFdFRU4uVHdlZW4oZGlzcE9iai5zY2FsZSlcclxuICAgICAgICAgICAgLnRvKHsgeDogb3JnU2NhbGVYICsgMC4zLCB5OiBvcmdTY2FsZVggKyAwLjMgfSwgMzUwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSk7XHJcblxyXG4gICAgICAgIHZhciBlbmRYID0gdGhpcy54O1xyXG4gICAgICAgIHZhciBlbmRZID0gdGhpcy55ICsgODtcclxuICAgICAgICB2YXIgbW92ZUF3YXkgPSBuZXcgVFdFRU4uVHdlZW4oZGlzcE9iai5wb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHsgeDogZW5kWCwgeTogZW5kWSB9LCAzNTApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkJhY2suSW4pXHJcbiAgICAgICAgICAgIC5vblVwZGF0ZSgocG9zOiBQSVhJLlBvaW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtQm9keS5wb3NpdGlvbiA9IFtkaXNwT2JqLnBvc2l0aW9uLngsIGRpc3BPYmoucG9zaXRpb24ueV07XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IGRpc3BPYmouc2NhbGUuc2V0KG9yZ1NjYWxlWCwgb3JnU2NhbGVZKSk7XHJcblxyXG4gICAgICAgIG1vdmVVcC5jaGFpbihzY2FsZSwgbW92ZUF3YXkpLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGVudGl0eSBmcm9tIHRoZSBwMiB3b3JsZCBhbmQgc2V0cyBpdHMgRGlzcGxheU9iamVjdCB0byBudWxsLlxyXG4gICAgICogSWYgdGhlIHJlbW92ZURpc3BsYXlPYmplY3QgaXMgdHJ1ZSB0aGUgZGlzcGxheSBvYmplY3Qgd2lsbCBiZSBhbHNvIHJlbW92ZWQgZnJvbSB0aGUgd29ybGRDb250YWluZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gYm9keVxyXG4gICAgICogQHBhcmFtIHJlbW92ZURpc3BsYXlPYmplY3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUVudGl0eShib2R5OiBwMi5Cb2R5LCByZW1vdmVEaXNwbGF5T2JqZWN0OiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICB3cDIucmVtb3ZlQm9keShib2R5KTtcclxuICAgICAgICBpZiAocmVtb3ZlRGlzcGxheU9iamVjdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCgoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgPSBudWxsO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQW5pbWF0ZWRTcHJpdGUsIEFuaW1hdGlvblNlcXVlbmNlIH0gZnJvbSBcIi4uL19lbmdpbmUvQW5pbWF0ZWRTcHJpdGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBMYXZhIGV4dGVuZHMgQW5pbWF0ZWRTcHJpdGUge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBGUkFNRV9TSVpFX1g6IG51bWJlciA9IDY0O1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBGUkFNRV9TSVpFX1k6IG51bWJlciA9IDEyODtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0dXJlTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRBbmltYXRpb25zKG5ldyBBbmltYXRpb25TZXF1ZW5jZShcImxhdmFcIiwgdGV4dHVyZU5hbWUsIFswLCAxLCAyLCAzXSwgdGhpcy5GUkFNRV9TSVpFX1gsIHRoaXMuRlJBTUVfU0laRV9ZKSk7XHJcbiAgICAgICAgdGhpcy5hbmNob3Iuc2V0KDAuNSwgMC43MCk7XHJcbiAgICAgICAgdGhpcy5wbGF5KFwibGF2YVwiLCAzKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IFNjZW5lTWFuYWdlciwgQnV0dG9uLCBTQ0VORV9XSURUSCB9IGZyb20gXCIuLlwiO1xyXG5cclxuY29uc3QgQlROX1ggPSBTQ0VORV9XSURUSCAtIDQ4O1xyXG5jb25zdCBCVE5fWSA9IDQ7XHJcbmNvbnN0IEJUTl9TQ0FMRSA9IDEuMDtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnRzIG9wdGlvbnMgYW5kIGZ1bGwgc2NyZWVuIHRvZ2xlIGJ1dHRvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWFzdGVySHVkIGV4dGVuZHMgUElYSS5Db250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzY2VuZU1hbmFnZXI6U2NlbmVNYW5hZ2VyKXtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgZnVsbCBzY3JlZW4gdG9nZ2xlclxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIFtcIlwiLCBcIndlYmtpdFwiLCBcIm1velwiLCBcIm1zXCJdLmZvckVhY2goXHJcbiAgICAgICAgICAgIHByZWZpeCA9PiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHByZWZpeCArIFwiZnVsbHNjcmVlbmNoYW5nZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRnVsbFNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bkZ1bGxTY3JlZW4uc2V0VGV4dHVyZShcImFzc2V0cy9ndWktYXRsYXMuanNvbkBndWlfZnNfZXhpdC5wbmdcIik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bkZ1bGxTY3JlZW4uc2V0VGV4dHVyZShcImFzc2V0cy9ndWktYXRsYXMuanNvbkBndWlfZnNfZW50ZXIucG5nXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnRuRnVsbFNjcmVlbi5zY2FsZS5zZXQoQlROX1NDQUxFKTtcclxuICAgICAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBhZGQgZnVsbCBzY3JlZW4sIG9wdGlvbnMgYW5kIFxyXG4gICAgICAgIC8vICBiYWNrIGJ1dHRvbnNcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAgICAgIFxyXG4gICAgICAgIHZhciBidG5GdWxsU2NyZWVuID0gbmV3IEJ1dHRvbihcImFzc2V0cy9ndWktYXRsYXMuanNvbkBndWlfZnNfZW50ZXIucG5nXCIsIEJUTl9YLCBCVE5fWSk7XHJcbiAgICAgICAgYnRuRnVsbFNjcmVlbi5vbkNsaWNrID0gKCkgPT4gdGhpcy50b2dnbGVGdWxsU2NyZWVuKCk7XHJcbiAgICAgICAgYnRuRnVsbFNjcmVlbi5zY2FsZS5zZXQoQlROX1NDQUxFKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKGJ0bkZ1bGxTY3JlZW4pO1xyXG5cclxuICAgICAgICB2YXIgYnRuT3B0aW9ucyA9IG5ldyBCdXR0b24oXCJhc3NldHMvZ3VpLWF0bGFzLmpzb25AZ3VpX29wdGlvbnMucG5nXCIsIEJUTl9YIC0gNDgsIEJUTl9ZKTtcclxuICAgICAgICBidG5PcHRpb25zLm9uQ2xpY2sgPSAoKSA9PiB0aGlzLnNjZW5lTWFuYWdlci5BY3RpdmF0ZVNjZW5lKFwiT3B0aW9uc1wiKTtcclxuICAgICAgICBidG5PcHRpb25zLm5hbWUgPSBcIkJUTl9PUFRJT05TXCI7XHJcbiAgICAgICAgYnRuT3B0aW9ucy5zY2FsZS5zZXQoQlROX1NDQUxFKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKGJ0bk9wdGlvbnMpO1xyXG4gICAgfSAgIFxyXG5cclxuICAgIHByaXZhdGUgZ2V0IGlzRnVsbFNjcmVlbigpOiBib29sZWFuIHtcclxuICAgICAgICB2YXIgZG9jOiBhbnkgPSBkb2N1bWVudDtcclxuICAgICAgICByZXR1cm4gISghZG9jLmZ1bGxzY3JlZW5FbGVtZW50ICYmICFkb2MubW96RnVsbFNjcmVlbkVsZW1lbnQgJiYgIWRvYy53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCAmJiAhZG9jLm1zRnVsbHNjcmVlbkVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB0b2dnbGVGdWxsU2NyZWVuKCkge1xyXG4gICAgICAgIHZhciBkb2M6IGFueSA9IGRvY3VtZW50O1xyXG4gICAgICAgIHZhciBkb2NFbG06IGFueSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHJcbiAgICAgICAgdmFyIHJlcXVlc3RGdWxsU2NyZWVuID0gZG9jRWxtLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGRvY0VsbS5tb3pSZXF1ZXN0RnVsbFNjcmVlbiB8fCBkb2NFbG0ud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gfHwgZG9jRWxtLm1zUmVxdWVzdEZ1bGxzY3JlZW47XHJcbiAgICAgICAgdmFyIGV4aXRGdWxsU2NyZWVuID0gZG9jLmV4aXRGdWxsc2NyZWVuIHx8IGRvYy5tb3pDYW5jZWxGdWxsU2NyZWVuIHx8IGRvYy53ZWJraXRFeGl0RnVsbHNjcmVlbiB8fCBkb2MubXNFeGl0RnVsbHNjcmVlbjtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzRnVsbFNjcmVlbikge1xyXG4gICAgICAgICAgICByZXF1ZXN0RnVsbFNjcmVlbi5jYWxsKGRvY0VsbSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXhpdEZ1bGxTY3JlZW4uY2FsbChkb2MpO1xyXG4gICAgICAgIH1cclxuICAgIH0gXHJcbn0iLCJpbXBvcnQgeyBLZXlib2FyZE1hcHBlciB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgV29ybGRQMiB9IGZyb20gJy4uL3dvcmxkL1dvcmxkUDInO1xyXG5pbXBvcnQgeyBzdGF0cyB9IGZyb20gJy4vUGxheWVyU3RhdHMnO1xyXG5pbXBvcnQgeyBldmVudEVtaXR0ZXIsIE1PVkVfVE9QSUMgfSBmcm9tICcuLi9ldmVudHMnO1xyXG5pbXBvcnQgeyBTdGF0VHlwZSB9IGZyb20gJy4uL2VudW1zJztcclxuXHJcbmV4cG9ydCBjbGFzcyBNb3ZlbWVudENvbnRyb2xsZXIge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBWRUxPQ0lUWSA9IDE1MDtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgSlVNUF9GT1JDRSA9IDE3OTAwO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBKVU1QX0FUVEFDS19GT1JDRSA9IC0xNDAwMDtcclxuXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IEpVTVBfQ09PTERPV04gPSA1MDA7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IEpVTVBfQVRUQUNLX0NPT0xET1dOID0gMjAwMDtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgSlVNUF9BVFRBQ0tfRlJFRVpFID0gODAwO1xyXG5cclxuXHJcbiAgICBwcml2YXRlIG5leHRKdW1wQWxsb3dlZDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgbmV4dEp1bXBEb3duQWxsb3dlZDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwcml2YXRlIHdvcmxkOiBXb3JsZFAyO1xyXG4gICAgcHJpdmF0ZSBtb3ZlbWVudFN0YXRlOiBNb3ZlbWVudFN0YXRlID0gLTE7XHJcbiAgICBwcml2YXRlIGtiZCA9IG5ldyBLZXlib2FyZE1hcHBlcigpO1xyXG5cclxuICAgIHByaXZhdGUgaXNSdW5uaW5nID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGlzSnVtcGluZyA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBuZXdTdGF0ZTogTW92ZW1lbnRTdGF0ZSA9IE1vdmVtZW50U3RhdGUuSWRsZTtcclxuXHJcbiAgICBwcml2YXRlIF9pc0ludGVyYWN0aXZlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iod29ybGQ6IFdvcmxkUDIpIHtcclxuICAgICAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGlmIHRoZSBwbGF5ZXIgY2FuIGludGVyYWN0IHZpYSBjb250cm9scy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBpc0ludGVyYWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0ludGVyYWN0aXZlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBpZiB0aGUgcGxheWVyIGNhbiBpbnRlcmFjdCB2aWEgY29udHJvbHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgaXNJbnRlcmFjdGl2ZShuZXdWYWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2lzSW50ZXJhY3RpdmUgPSBuZXdWYWx1ZTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW50ZXJhY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlbWVudFN0YXRlID0gTW92ZW1lbnRTdGF0ZS5JZGxlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IElzSnVtcGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc0p1bXBpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBDYW5KdW1wKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pc0p1bXBpbmcgJiYgdGhpcy5uZXh0SnVtcEFsbG93ZWQgPCBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IElzUnVubmluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc1J1bm5pbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBNb3ZlbWVudFN0YXRlKCk6IE1vdmVtZW50U3RhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVtZW50U3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIFN0YXJ0SnVtcChkaXJlY3Rpb246IE1vdmVtZW50U3RhdGUuSnVtcExlZnQgfCBNb3ZlbWVudFN0YXRlLkp1bXBSaWdodCB8IE1vdmVtZW50U3RhdGUuSnVtcFVwKTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGZvcmNlVmVjdG9yOiBBcnJheTxudW1iZXI+O1xyXG5cclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBNb3ZlbWVudFN0YXRlLkp1bXBVcCkge1xyXG4gICAgICAgICAgICBmb3JjZVZlY3RvciA9IFswLCB0aGlzLkpVTVBfRk9SQ0VdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBNb3ZlbWVudFN0YXRlLkp1bXBMZWZ0KSB7XHJcbiAgICAgICAgICAgIGZvcmNlVmVjdG9yID0gWy10aGlzLkpVTVBfRk9SQ0UgKiAwLjEwLCB0aGlzLkpVTVBfRk9SQ0VdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSBNb3ZlbWVudFN0YXRlLkp1bXBSaWdodCkge1xyXG4gICAgICAgICAgICBmb3JjZVZlY3RvciA9IFt0aGlzLkpVTVBfRk9SQ0UgKiAwLjEwLCB0aGlzLkpVTVBfRk9SQ0VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndvcmxkLnBsYXllckJvZHkuYXBwbHlJbXB1bHNlKGZvcmNlVmVjdG9yKTtcclxuICAgICAgICB0aGlzLndvcmxkLmNsZWFyQ29udGFjdHNGb3JCb2R5KHRoaXMud29ybGQucGxheWVyQm9keSk7XHJcbiAgICAgICAgdGhpcy5uZXh0SnVtcEFsbG93ZWQgPSBwZXJmb3JtYW5jZS5ub3coKSArIHRoaXMuSlVNUF9DT09MRE9XTjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgU3RhcnRKdW1wRG93bigpOiB2b2lkIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZW1lbnRTdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuTGVmdDpcclxuICAgICAgICAgICAgY2FzZSBNb3ZlbWVudFN0YXRlLkp1bXBMZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdTdGF0ZSA9IE1vdmVtZW50U3RhdGUuSnVtcERvd25MZWZ0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuUmlnaHQ6XHJcbiAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5KdW1wUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1N0YXRlID0gTW92ZW1lbnRTdGF0ZS5KdW1wRG93blJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdTdGF0ZSA9IE1vdmVtZW50U3RhdGUuSnVtcERvd247XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGF0ZSBjaGFuZ2U6IFwiICsgTW92ZW1lbnRTdGF0ZVt0aGlzLm1vdmVtZW50U3RhdGVdICsgXCIgLT4gXCIgKyBNb3ZlbWVudFN0YXRlW3RoaXMubmV3U3RhdGVdKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZm9yY2VWZWN0b3I6IG51bWJlcltdID0gWzAsIHRoaXMuSlVNUF9BVFRBQ0tfRk9SQ0VdO1xyXG4gICAgICAgIHRoaXMud29ybGQucGxheWVyQm9keS5zZXRaZXJvRm9yY2UoKTtcclxuICAgICAgICB0aGlzLndvcmxkLnBsYXllckJvZHkuYXBwbHlJbXB1bHNlKGZvcmNlVmVjdG9yKTtcclxuICAgICAgICB0aGlzLm5leHRKdW1wRG93bkFsbG93ZWQgPSBwZXJmb3JtYW5jZS5ub3coKSArIHRoaXMuSlVNUF9BVFRBQ0tfQ09PTERPV047XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pc0ludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmlzSW50ZXJhY3RpdmUgPSB0cnVlLCB0aGlzLkpVTVBfQVRUQUNLX0ZSRUVaRSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoTU9WRV9UT1BJQywge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZTogdGhpcy5uZXdTdGF0ZSxcclxuICAgICAgICAgICAgb2xkU3RhdGU6IHRoaXMubW92ZW1lbnRTdGF0ZSxcclxuICAgICAgICAgICAgaXNKdW1waW5nOiB0cnVlLFxyXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlIC8vIG1ha2VzIG5vIGRpZmZlcmVuY2UgZHVyaW5nIGp1bXBzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudFN0YXRlID0gdGhpcy5uZXdTdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKGR0OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgY29uc3QgS0VZX0E6IG51bWJlciA9IDY1O1xyXG4gICAgICAgIGNvbnN0IEtFWV9EOiBudW1iZXIgPSA2ODtcclxuICAgICAgICBjb25zdCBLRVlfVzogbnVtYmVyID0gODc7XHJcbiAgICAgICAgY29uc3QgS0VZX1M6IG51bWJlciA9IDgzO1xyXG5cclxuICAgICAgICBjb25zdCBLRVlfU0hJRlQ6IG51bWJlciA9IDE2O1xyXG4gICAgICAgIGNvbnN0IEtFWV9MRUZUOiBudW1iZXIgPSAzNztcclxuICAgICAgICBjb25zdCBLRVlfUklHSFQ6IG51bWJlciA9IDM5O1xyXG4gICAgICAgIGNvbnN0IEtFWV9VUDogbnVtYmVyID0gMzg7XHJcbiAgICAgICAgY29uc3QgS0VZX0RPV046IG51bWJlciA9IDQwO1xyXG4gICAgICAgIGNvbnN0IFNQQUNFOiBudW1iZXIgPSAzMjtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdTdGF0ZSA9IE1vdmVtZW50U3RhdGUuSWRsZTtcclxuXHJcbiAgICAgICAgdmFyIGlzTW92aW5nVmVydGljYWx5ID0gTWF0aC5hYnModGhpcy53b3JsZC5wbGF5ZXJCb2R5LnZlbG9jaXR5WzFdKSA+IDAuMDE7XHJcbiAgICAgICAgaWYgKGlzTW92aW5nVmVydGljYWx5KSB7XHJcbiAgICAgICAgICAgIGxldCBoYXNPbmx5U2Vuc29yQ29udGFjdHMgPSB0aGlzLndvcmxkLnBsYXllckNvbnRhY3RzLmV2ZXJ5KChib2R5KSA9PiBib2R5LnNoYXBlc1swXS5zZW5zb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmlzSnVtcGluZyA9IGhhc09ubHlTZW5zb3JDb250YWN0cztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmlzSnVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gIGNhbGN1bGF0ZSB0aGUgaG9yaXpvbnRhbCB2ZWxvY2l0eVxyXG4gICAgICAgIHZhciB2OiBudW1iZXIgPSB0aGlzLmNhbGNNb3ZlbWVudFZlbG9jaXR5KCk7XHJcblxyXG4gICAgICAgIC8vICBubyBtb3ZlbWVudCAoZXhjZXB0IGp1bXAgZG93bikgd2hpbGUganVtcGluZ1xyXG4gICAgICAgIGlmICh0aGlzLmlzSnVtcGluZyAmJiB0aGlzLl9pc0ludGVyYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5rYmQuaXNLZXlEb3duKEtFWV9TKSB8fCB0aGlzLmtiZC5pc0tleURvd24oS0VZX0RPV04pKSAmJiBzdGF0cy5IYXNKdW1wQXRhY2sgJiYgdGhpcy5uZXh0SnVtcERvd25BbGxvd2VkIDwgcGVyZm9ybWFuY2Uubm93KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU3RhcnRKdW1wRG93bigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud29ybGQucGxheWVyQm9keS52ZWxvY2l0eVswXSArPSB2O1xyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vICBjYWxjdWxhdGUgdGhlIGhvcml6b250YWwgdmVsb2NpdHlcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5wbGF5ZXJCb2R5LnZlbG9jaXR5WzBdID0gdjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB2YXIgY2FuUnVuID0gc3RhdHMuZ2V0U3RhdChTdGF0VHlwZS5EdXN0KSA+IDE7XHJcbiAgICAgICAgdmFyIG5ld0lzUnVubmluZzogYm9vbGVhbiA9IHRoaXMua2JkLmlzS2V5RG93bihLRVlfU0hJRlQpICYmIGNhblJ1biAmJiB0aGlzLl9pc0ludGVyYWN0aXZlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5rYmQuaXNLZXlEb3duKEtFWV9BKSB8fCB0aGlzLmtiZC5pc0tleURvd24oS0VZX0xFRlQpICkge1xyXG4gICAgICAgICAgICB0aGlzLm5ld1N0YXRlID0gTW92ZW1lbnRTdGF0ZS5MZWZ0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5rYmQuaXNLZXlEb3duKEtFWV9EKSB8fCB0aGlzLmtiZC5pc0tleURvd24oS0VZX1JJR0hUKSkge1xyXG4gICAgICAgICAgICB0aGlzLm5ld1N0YXRlID0gTW92ZW1lbnRTdGF0ZS5SaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICBjaGVjayBpZiBqdW1wIGlzIHByZXNzZWRcclxuICAgICAgICBpZiAoKHRoaXMua2JkLmlzS2V5RG93bihLRVlfVykgfHwgdGhpcy5rYmQuaXNLZXlEb3duKEtFWV9VUCkgfHwgdGhpcy5rYmQuaXNLZXlEb3duKFNQQUNFKSkgJiYgdGhpcy5DYW5KdW1wKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVtZW50U3RhdGUgPT09IE1vdmVtZW50U3RhdGUuTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdTdGF0ZSA9IE1vdmVtZW50U3RhdGUuSnVtcExlZnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3ZlbWVudFN0YXRlID09PSBNb3ZlbWVudFN0YXRlLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1N0YXRlID0gTW92ZW1lbnRTdGF0ZS5KdW1wUmlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3ZlbWVudFN0YXRlID09PSBNb3ZlbWVudFN0YXRlLklkbGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3U3RhdGUgPSBNb3ZlbWVudFN0YXRlLkp1bXBVcDtcclxuICAgICAgICAgICAgICAgIG5ld0lzUnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgaGFzIHN0YXRlIGNoYW5nZWRcclxuICAgICAgICBpZiAodGhpcy5uZXdTdGF0ZSAhPT0gdGhpcy5tb3ZlbWVudFN0YXRlIHx8IG5ld0lzUnVubmluZyAhPT0gdGhpcy5Jc1J1bm5pbmcpIHtcclxuICAgICAgICAgICAgdmFyIGlzQ3VycmVudEp1bXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm5ld1N0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcExlZnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5TdGFydEp1bXAoTW92ZW1lbnRTdGF0ZS5KdW1wTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNDdXJyZW50SnVtcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1vdmVtZW50U3RhdGUuSnVtcFJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuU3RhcnRKdW1wKE1vdmVtZW50U3RhdGUuSnVtcFJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBpc0N1cnJlbnRKdW1waW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTW92ZW1lbnRTdGF0ZS5KdW1wVXA6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5TdGFydEp1bXAoTW92ZW1lbnRTdGF0ZS5KdW1wVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzQ3VycmVudEp1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KE1PVkVfVE9QSUMsIHtcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB0aGlzLm5ld1N0YXRlLFxyXG4gICAgICAgICAgICAgICAgb2xkU3RhdGU6IHRoaXMubW92ZW1lbnRTdGF0ZSxcclxuICAgICAgICAgICAgICAgIGlzSnVtcGluZzogaXNDdXJyZW50SnVtcGluZyxcclxuICAgICAgICAgICAgICAgIGlzUnVubmluZzogbmV3SXNSdW5uaW5nIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICB1cGRhdGUgbmV3IHN0YXRlc1xyXG4gICAgICAgIHRoaXMubW92ZW1lbnRTdGF0ZSA9IHRoaXMubmV3U3RhdGU7XHJcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBuZXdJc1J1bm5pbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjTW92ZW1lbnRWZWxvY2l0eSgpOiBudW1iZXIge1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb246IG51bWJlciA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZW1lbnRTdGF0ZSA9PT0gTW92ZW1lbnRTdGF0ZS5MZWZ0IHx8IHRoaXMubW92ZW1lbnRTdGF0ZSA9PT0gTW92ZW1lbnRTdGF0ZS5KdW1wTGVmdCkge1xyXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSAtMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW92ZW1lbnRTdGF0ZSA9PT0gTW92ZW1lbnRTdGF0ZS5SaWdodCB8fCB0aGlzLm1vdmVtZW50U3RhdGUgPT09IE1vdmVtZW50U3RhdGUuSnVtcFJpZ2h0KSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5Jc0p1bXBpbmcpIHtcclxuICAgICAgICAgICAgLy8gIGFsbG93IGZvciBzb21lIG1pbmltYWwgaG9yaXpvbnRhbCBtb3ZlbWVudCAodGhpcyBpcyB0byBwcmV2ZW50IGdldHRpbmcgc3R1Y2sgaW4gYWlyIGlmIGJldHdlZW4gdHdvIGJvZGllcyB3aXRoIGZyaWN0aW9uIGFuZCBubyBjb250YWN0cylcclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGlvbiAqIDAuMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdmVsb2NpdHk6IG51bWJlciA9IGRpcmVjdGlvbiAqIHRoaXMuVkVMT0NJVFkgKiAodGhpcy5Jc1J1bm5pbmcgPyAyIDogMS4wKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlbG9jaXR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTW92ZW1lbnRTdGF0ZSB7XHJcbiAgICBMZWZ0LFxyXG4gICAgUmlnaHQsXHJcbiAgICBJZGxlLFxyXG5cclxuICAgIEp1bXBMZWZ0LFxyXG4gICAgSnVtcFJpZ2h0LFxyXG4gICAgSnVtcFVwLFxyXG5cclxuICAgIEp1bXBEb3duTGVmdCxcclxuICAgIEp1bXBEb3duUmlnaHQsXHJcbiAgICBKdW1wRG93bixcclxufSIsImltcG9ydCB7IFRleHR1cmVMb2FkZXIgfSBmcm9tICcuLic7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxhdGZvcm0gZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB0aWxlc1ggbnVtYmVyIG9mIGhvcml6b250YWwgbWlkIHRpbGVzLiBOb3RlOiB0aGlzIGlzIHRoZSBudW1iZXIgb2YgbWlkIHRpbGVzIC0gdGhlIGFjdHVhbCB3aWR0aCBpcyB0aWxlc1ggKyAyXHJcbiAgICAgKiBAcGFyYW0gdGlsZXNZIG51bWJlciBvZiB2ZXJ0aWNhbCB0aWxlc1xyXG4gICAgICogQHBhcmFtIHRleHR1cmVzIGFycmF5IG9mIHRleHR1cmVzIGluIHNwZWNpZmljIG9yZGVyOiB0b3AgbWlkLCB0b3AgbGVmdCwgdG9wIHJpZ2h0LCBib3R0b20gbWlkLCBib3R0b20gbGVmdCwgYm90dG9tIHJpZ2h0LlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih0aWxlc1g6IG51bWJlciA9IDEsIHRpbGVzWTogbnVtYmVyID0gMSwgdGV4dHVyZXM6c3RyaW5nW10pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnNjYWxlLnNldCgxLCAtMSk7ICAgLy8gIHNjYWxlIGludmVydCBzaW5jZSBldmVyeXRoaW5nIGlzIHVwc2lkZSBkb3duIGR1ZSB0byBjb29yZGluYXRlIHN5c3RlbVxyXG5cclxuICAgICAgICB2YXIgdGV4dHVyZU5hbWVUb3BMZWZ0OiBzdHJpbmcsXHJcbiAgICAgICAgICAgIHRleHR1cmVOYW1lVG9wUmlnaHQ6IHN0cmluZyxcclxuICAgICAgICAgICAgdGV4dHVyZU5hbWVCdG1NaWQ6IHN0cmluZyxcclxuICAgICAgICAgICAgdGV4dHVyZU5hbWVCdG1MZWZ0OiBzdHJpbmcsXHJcbiAgICAgICAgICAgIHRleHR1cmVOYW1lQnRtUmlnaHQ6IHN0cmluZztcclxuXHJcbiAgICAgICAgLy8gIHRoaXMgb25lIG11c3QgZXhpc3RcclxuICAgICAgICB2YXIgdGV4dHVyZU5hbWVUb3BNaWQ6IHN0cmluZyA9IHRleHR1cmVzWzBdO1xyXG4gICAgICAgIGlmICh0aWxlc1ggPiAxIHx8IHRleHR1cmVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGV4dHVyZU5hbWVUb3BMZWZ0ID0gdGV4dHVyZXNbMV07XHJcbiAgICAgICAgICAgIHRleHR1cmVOYW1lVG9wUmlnaHQgPSB0ZXh0dXJlc1syXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGVzWSA+IDEpIHtcclxuICAgICAgICAgICAgdGV4dHVyZU5hbWVCdG1NaWQgPSB0ZXh0dXJlc1szXTtcclxuICAgICAgICAgICAgdGV4dHVyZU5hbWVCdG1MZWZ0ID0gdGV4dHVyZXNbNF07XHJcbiAgICAgICAgICAgIHRleHR1cmVOYW1lQnRtUmlnaHQgPSB0ZXh0dXJlc1s1XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNwcjogUElYSS5TcHJpdGU7XHJcbiAgICAgICAgdmFyIHggPSAwO1xyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIGxlZnQgYm9yZGVyXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIGlmICh0ZXh0dXJlTmFtZVRvcExlZnQpIHtcclxuICAgICAgICAgICAgLy90ZXh0dXJlID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW3RleHR1cmVOYW1lVG9wTGVmdF0udGV4dHVyZTtcclxuICAgICAgICAgICAgdGV4dHVyZSA9IFRleHR1cmVMb2FkZXIuR2V0KHRleHR1cmVOYW1lVG9wTGVmdCk7XHJcbiAgICAgICAgICAgIHNwciA9IG5ldyBQSVhJLlNwcml0ZSh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgc3ByLnBvc2l0aW9uLnNldCh4KzEsIDApO1xyXG4gICAgICAgICAgICB4ICs9IHRleHR1cmUud2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoc3ByKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgbWlkIHRpbGVzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vdmFyIHRleHR1cmUgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNbdGV4dHVyZU5hbWVUb3BNaWRdLnRleHR1cmU7XHJcbiAgICAgICAgdmFyIHRleHR1cmUgPSBUZXh0dXJlTG9hZGVyLkdldCh0ZXh0dXJlTmFtZVRvcE1pZCk7XHJcbiAgICAgICAgaWYgKHRpbGVzWCA+IDEpIHtcclxuICAgICAgICAgICAgbGV0IHcgPSB0ZXh0dXJlLndpZHRoICogdGlsZXNYO1xyXG4gICAgICAgICAgICBsZXQgaCA9IHRleHR1cmUuaGVpZ2h0O1xyXG4gICAgICAgICAgICBzcHIgPSBuZXcgUElYSS5leHRyYXMuVGlsaW5nU3ByaXRlKHRleHR1cmUsIHcsIGgpO1xyXG4gICAgICAgICAgICBzcHIucG9zaXRpb24uc2V0KHgsIDApO1xyXG4gICAgICAgICAgICB4ICs9IHc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3ByID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpO1xyXG4gICAgICAgICAgICBzcHIucG9zaXRpb24uc2V0KHgsIDApO1xyXG4gICAgICAgICAgICB4ICs9IHNwci53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChzcHIpO1xyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIHJpZ2h0IGJvcmRlclxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBpZiAodGV4dHVyZU5hbWVUb3BSaWdodCkge1xyXG4gICAgICAgICAgICAvL3RleHR1cmUgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNbdGV4dHVyZU5hbWVUb3BSaWdodF0udGV4dHVyZTtcclxuICAgICAgICAgICAgdGV4dHVyZSA9IFRleHR1cmVMb2FkZXIuR2V0KHRleHR1cmVOYW1lVG9wUmlnaHQpO1xyXG4gICAgICAgICAgICBzcHIgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSk7XHJcbiAgICAgICAgICAgIHNwci5wb3NpdGlvbi5zZXQoeCAtMSwgMCk7XHJcbiAgICAgICAgICAgIHggKz0gc3ByLndpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKHNwcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIGZpbGwgZG93bndhcmRzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIGxldCB4VGlsZXMgPSB0aWxlc1ggKyAyO1xyXG4gICAgICAgIGlmICh0aWxlc1kgPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgeFRpbGVzOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBuYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSB0ZXh0dXJlTmFtZUJ0bUxlZnQ7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeCA9PT0geFRpbGVzIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSB0ZXh0dXJlTmFtZUJ0bVJpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdGV4dHVyZU5hbWVCdG1NaWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeSA9IDE7IHkgPCB0aWxlc1k7IHkrKykgeyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy90ZXh0dXJlID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW25hbWVdLnRleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZSA9IFRleHR1cmVMb2FkZXIuR2V0KG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwciA9IG5ldyBQSVhJLlNwcml0ZSh0ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICBzcHIucG9zaXRpb24uc2V0KHggKiBzcHIud2lkdGgsIHkgKiBzcHIuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKHNwcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBMZXZlbERlZmluaXRpb25zIH0gZnJvbSAnLi4vZ2xvYmFsJztcclxuaW1wb3J0IHsgZXZlbnRFbWl0dGVyLCBEQU1BR0VfVE9QSUMsIFNUQVRDSEFOR0VfVE9QSUMsIEJVUk5fVE9QSUMsIElTdGF0Q2hhbmdlRXZlbnQsIElEcHNDaGFuZ2VFdmVudH0gZnJvbSBcIi4uL2V2ZW50c1wiO1xyXG5pbXBvcnQgeyBMZXZlbExvYWRlciB9IGZyb20gJy4uL3dvcmxkL0xldmVsTG9hZGVyJztcclxuaW1wb3J0IHsgSUxldmVsIH0gZnJvbSAnLi4vd29ybGQvTGV2ZWxJbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgQmFzZVN0YXRUeXBlLCBTdGF0VHlwZSwgRGFtYWdlVHlwZSB9IGZyb20gJy4uL2VudW1zJztcclxuXHJcblxyXG5cclxuY2xhc3MgUGxheWVyU3RhdHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIHN0YXRzIGFyZSBmaXhlZCB2YWx1ZXMgaW5jcmVhc2VkIHdpdGggbGV2ZWwuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYmFzZVN0YXRzOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRyaWJ1dGUgc3RhdHMgYXJlIHBsYXllciBhc3NpZ25lZCB2YWx1ZXMgKHBvaW50IGRpc3RyaWJ1dGlvbikuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXR0cmlidXRlU3RhdHM6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzdGF0czogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgYWNjdW11bGF0b3I6IG51bWJlciA9IDAuMDtcclxuICAgIHByaXZhdGUgZHBzRGVjcmVhc2VBbW91bnQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBleHBGb3JMZXZlbDogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG5cclxuICAgIC8vICBhY3F1aXJlZCBza2lsbHNcclxuICAgIHByaXZhdGUgaGFzSnVtcEF0dGFjazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBoYXNNYWdpY0F0dGFjazogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIC8vICBhY2hpZXZlbWVudCBsZXZlbHNcclxuICAgIHB1YmxpYyBjaGFyYWN0ZXJMZXZlbDogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBjdXJyZW50R2FtZUxldmVsOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBleHBGb3JOZXh0TGV2ZWw6IG51bWJlciA9IDA7XHJcblxyXG4gICAgLy8gIHVzZXIgcmVsYXRlZFxyXG4gICAgcHVibGljIGlkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBpc0J1cm5pbmdCdWZmOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgIFN0b3JlcyB0aW1lc3RhbXBzIChVbml4IHRpbWVzdGFtcHMgaW4gc2Vjb25kcyB3aXRoIGZyYWN0aW9ucykgd2hlbiB0aGUgYnVmZiBlbGFwc2VzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnVmZnM6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIGxldmVsTG9hZGVyIDogTGV2ZWxMb2FkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IDA7XHJcblxyXG4gICAgICAgIC8vICBhdHRyICBzdGF0c1xyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlU3RhdHNbQmFzZVN0YXRUeXBlLlJlZ2VuSFBdID0gMDtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZVN0YXRzW0Jhc2VTdGF0VHlwZS5SZWdlbkR1c3RdID0gMDtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZVN0YXRzW0Jhc2VTdGF0VHlwZS5NYXhIUF0gPSAwO1xyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlU3RhdHNbQmFzZVN0YXRUeXBlLk1heER1c3RdID0gMDtcclxuXHJcbiAgICAgICAgLy8gcnVudGltZSBzdGF0c1xyXG4gICAgICAgIHRoaXMuc3RhdHNbU3RhdFR5cGUuQ29pbnNdID0gMDtcclxuICAgICAgICB0aGlzLnN0YXRzW1N0YXRUeXBlLkR1c3RdID0gNjAwO1xyXG4gICAgICAgIHRoaXMuc3RhdHNbU3RhdFR5cGUuVG90YWxFeHBdID0gMDtcclxuICAgICAgICB0aGlzLnN0YXRzW1N0YXRUeXBlLkF0dHJpYnV0ZVBvaW50c10gPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdHNbU3RhdFR5cGUuSFBdID0gMTIwO1xyXG5cclxuICAgICAgICBsZXQgZGlmZiA9IDEwMDA7XHJcbiAgICAgICAgUGxheWVyU3RhdHMuZXhwRm9yTGV2ZWxbMF0gPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMTAwMDA7IGkrKykge1xyXG4gICAgICAgICAgICBQbGF5ZXJTdGF0cy5leHBGb3JMZXZlbFtpXSA9IFBsYXllclN0YXRzLmV4cEZvckxldmVsW2kgLSAxXSArIChpICogZGlmZik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlYnVpbGRTdGF0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUnRldXJucyB0aGUgbGV2ZWwgbG9hZGVyLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IExldmVsTG9hZGVyKCl7XHJcbiAgICAgICAgaWYoIXRoaXMubGV2ZWxMb2FkZXIpe1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsTG9hZGVyID0gbmV3IExldmVsTG9hZGVyKExldmVsRGVmaW5pdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5sZXZlbExvYWRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICBVcGRhdGVzIHN0YXRzIHRoYXQgaW5jcmVhc2UvZGVjcmVhc2Ugb3ZlciB0aW1lLlxyXG4gICAgICogIFRoZSB1cGRhdGUgaXMgY2FsY3VsYXRlZCBpbiBhIGhhbGYgc2Vjb25kIGludGVydmFsLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb25VcGRhdGUgPSAoZHQ6IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICBsZXQgSU5URVJWQUwgPSA1MDA7XHJcbiAgICAgICAgbGV0IFNFQ09ORF8yX0lOVEVSVkFMID0gSU5URVJWQUwgLyAxMDAwOyAvLyAgdGhpcyBmYWN0b3IgY29udmVydHMgcGVyIHNlY29uZCB2YWx1ZXMgdG8gcGVyIGludGVydmFsIHZhbHVlc1xyXG5cclxuICAgICAgICB2YXIgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xyXG5cclxuICAgICAgICAvLyAgYWNjdW11bGF0ZSBkcHNcclxuICAgICAgICBmb3IgKGxldCBpID0gMTAwMCwgbGVuID0gdGhpcy5idWZmcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5idWZmc1tpXSAmJiB0aGlzLmJ1ZmZzW2ldID4gbm93KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHBzID0gMDtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGFtYWdlVHlwZS5MYXZhQm9yZGVyOiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRwcyA9IDU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGFtYWdlVHlwZS5MYXZhOiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRwcyA9IDE1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIERhbWFnZVR5cGUuUG9pc29uOiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRwcyA9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBkbWcgPSBkdCAqIDAuMDAxICogZHBzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcHNEZWNyZWFzZUFtb3VudCArPSBkbWc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICBoYW5kbGUgb25jZSBwZXIgaW50ZXJ2YWwgdGlja3NcclxuICAgICAgICB0aGlzLmFjY3VtdWxhdG9yICs9IGR0O1xyXG4gICAgICAgIGlmICh0aGlzLmFjY3VtdWxhdG9yID4gSU5URVJWQUwpIHtcclxuICAgICAgICAgICAgdGhpcy5hY2N1bXVsYXRvciAtPSBJTlRFUlZBTDtcclxuXHJcbiAgICAgICAgICAgIC8vICBkdXN0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRzW1N0YXRUeXBlLkR1c3RdIDwgdGhpcy5zdGF0c1tTdGF0VHlwZS5NYXhEdXN0XSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLnN0YXRzW1N0YXRUeXBlLlJlZ2VuRHVzdF0gKiBTRUNPTkRfMl9JTlRFUlZBTDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLkR1c3QsIHYpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAgaHBcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHNbU3RhdFR5cGUuSFBdIDwgdGhpcy5zdGF0c1tTdGF0VHlwZS5NYXhIUF0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5zdGF0c1tTdGF0VHlwZS5SZWdlbkhQXSAqIFNFQ09ORF8yX0lOVEVSVkFMO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmNyZWFzZVN0YXQoU3RhdFR5cGUuSFAsIHYpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAgZHBzXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRwc0RlY3JlYXNlQW1vdW50ID49IDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBhbW91bnQgPSBNYXRoLmZsb29yKHRoaXMuZHBzRGVjcmVhc2VBbW91bnQpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50OiBJRHBzQ2hhbmdlRXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2xkVmFsdWU6IHRoaXMuc3RhdHNbU3RhdFR5cGUuSFBdLFxyXG4gICAgICAgICAgICAgICAgICAgIEFtb3VudDogLWFtb3VudFxyXG4gICAgICAgICAgICAgICAgfTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChEQU1BR0VfVE9QSUMsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLkhQLCAtYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHBzRGVjcmVhc2VBbW91bnQgLT0gYW1vdW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIGNoZWNrIGlmIGlzIGJ1cm5pbmdcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbGV0IHdhc0J1cm5pbmcgPSB0aGlzLmlzQnVybmluZ0J1ZmY7XHJcbiAgICAgICAgdGhpcy5pc0J1cm5pbmdCdWZmID0gdGhpcy5idWZmc1tEYW1hZ2VUeXBlLkxhdmFCb3JkZXJdID4gbm93IHx8IHRoaXMuYnVmZnNbRGFtYWdlVHlwZS5MYXZhXSA+IG5vdztcclxuICAgICAgICBpZiAod2FzQnVybmluZyAhPT0gdGhpcy5pc0J1cm5pbmcpIHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoQlVSTl9UT1BJQywgeyB3YXNCdXJuaW5nOiB3YXNCdXJuaW5nLCBpc0J1cm5pbmc6IHRoaXMuaXNCdXJuaW5nQnVmZiB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwbGF5ZXIgaXMgdGFraW5nIGJ1cm4gZGFtYWdlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlzQnVybmluZygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc0J1cm5pbmdCdWZmO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHBhcnNlZCBjdXJyZW50IGxldmVsLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3VycmVudExldmVsIDogSUxldmVsO1xyXG5cclxuICAgIHB1YmxpYyBsb2FkTGV2ZWwoKXtcclxuICAgICAgICB0aGlzLmxvYWRVc2VyU3RhdGUoKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRMZXZlbCA9ICB0aGlzLkxldmVsTG9hZGVyLmJ1aWxkTGV2ZWwodGhpcy5jdXJyZW50R2FtZUxldmVsKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNhdmVzIHVzZXIgZGF0YS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNhdmVVc2VyU3RhdGUoaXNMZXZlbENvbXBsZXRlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChpc0xldmVsQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEdhbWVMZXZlbCArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbW9kZWwgPSB7XHJcbiAgICAgICAgICAgIEV4dGVybmFsSWQ6IHRoaXMuaWQsXHJcbiAgICAgICAgICAgIENvaW5zOiB0aGlzLnN0YXRzW1N0YXRUeXBlLkNvaW5zXSxcclxuICAgICAgICAgICAgR29sZDogdGhpcy5zdGF0c1tTdGF0VHlwZS5Hb2xkXSxcclxuICAgICAgICAgICAgRHVzdDogTWF0aC5mbG9vcih0aGlzLnN0YXRzW1N0YXRUeXBlLkR1c3RdKSxcclxuICAgICAgICAgICAgRXhwOiB0aGlzLnN0YXRzW1N0YXRUeXBlLlRvdGFsRXhwXSxcclxuICAgICAgICAgICAgQXRyUHRzOiB0aGlzLnN0YXRzW1N0YXRUeXBlLkF0dHJpYnV0ZVBvaW50c10sXHJcbiAgICAgICAgICAgIEhQOiB0aGlzLnN0YXRzW1N0YXRUeXBlLkhQXSxcclxuICAgICAgICAgICAgTGFzdExldmVsOiB0aGlzLmN1cnJlbnRHYW1lTGV2ZWwsXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBzZW5kaW5nIHNraWxscyBldGMuXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBBamF4SGVscGVyLlBvc3QoYmFzZVVybCArIFwiL2FwaS91c2VyL3NhdmVcIiwgbW9kZWwsIChkYXRhLCBzdGF0dXMpID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjb25uZWN0VXNlcigpIHJlc3BvbnNlXCIsIGRhdGEpO1xyXG4gICAgICAgIC8vIH0pO1xyXG4gICAgICAgIC8vVE9ETzogaW1wbGVtZW50XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkcyB1c2VyIGRhdGEuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2FkVXNlclN0YXRlKCkge1xyXG4gICAgICAgIGxldCBtb2RlbCA9IHsgaWQ6IHRoaXMuaWQgfTtcclxuICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgSFA6IHRoaXMuZ2V0U3RhdChTdGF0VHlwZS5NYXhIUCksXHJcbiAgICAgICAgICAgIEV4cCA6IHRoaXMuZ2V0U3RhdChTdGF0VHlwZS5Ub3RhbEV4cCksXHJcbiAgICAgICAgICAgIENvaW5zOiB0aGlzLmdldFN0YXQoU3RhdFR5cGUuQ29pbnMpLFxyXG4gICAgICAgICAgICBEdXN0OiB0aGlzLmdldFN0YXQoU3RhdFR5cGUuTWF4RHVzdCksXHJcbiAgICAgICAgICAgIEdvbGQ6IDAsXHJcbiAgICAgICAgICAgIEF0clB0czogMCxcclxuICAgICAgICAgICAgTGFzdExldmVsOiB0aGlzLmN1cnJlbnRHYW1lTGV2ZWxcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vICB0b2RvOiBodHRwIGdldFxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibG9hZFVzZXJTdGF0ZSgpIHJlc3BvbnNlXCIsIGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgc3RhdHMuY3VycmVudEdhbWVMZXZlbCA9IGRhdGEuTGFzdExldmVsO1xyXG5cclxuICAgICAgICAgICAgLy8gIHdlIG5ldmVyIGFjY2VwdCAwIGhwLCBjb252ZXJ0IHRvIGZ1bGwgaGVhbHRoIGluc3RlYWRcclxuICAgICAgICAgICAgaWYgKGRhdGEuSFAgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5IUCA9IHRoaXMuc3RhdHNbU3RhdFR5cGUuTWF4SFBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5IUCwgZGF0YS5IUCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5Db2lucywgZGF0YS5Db2lucyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5Hb2xkLCBkYXRhLkdvbGQpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXQoU3RhdFR5cGUuRHVzdCwgZGF0YS5EdXN0KTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0KFN0YXRUeXBlLkF0dHJpYnV0ZVBvaW50cywgZGF0YS5BdHJQdHMpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXQoU3RhdFR5cGUuVG90YWxFeHAsIGRhdGEuRXhwKTtcclxuICAgICAgICAgICAgLy8gIFRPRE86IGF0dHJpYnV0ZVN0YXRzXHJcbiAgICAgICAgICAgIHRoaXMucmVidWlsZFN0YXRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBIYXNKdW1wQXRhY2soKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzSnVtcEF0dGFjaztcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgSGFzSnVtcEF0YWNrKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5oYXNKdW1wQXR0YWNrID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFN0YXQodHlwZTogU3RhdFR5cGUsIHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnN0YXRzW3R5cGVdID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IFN0YXRUeXBlLlRvdGFsRXhwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyTGV2ZWwgPSBQbGF5ZXJTdGF0cy5maW5kRXhwTGV2ZWwodmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRzW1N0YXRUeXBlLkxldmVsTWF4RXhwXSA9IFBsYXllclN0YXRzLmV4cEZvckxldmVsW3RoaXMuY2hhcmFjdGVyTGV2ZWwgKyAxXSAtIFBsYXllclN0YXRzLmV4cEZvckxldmVsW3RoaXMuY2hhcmFjdGVyTGV2ZWxdO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRzW1N0YXRUeXBlLkxldmVsRXhwXSA9IHRoaXMuc3RhdHNbU3RhdFR5cGUuVG90YWxFeHBdIC0gUGxheWVyU3RhdHMuZXhwRm9yTGV2ZWxbdGhpcy5jaGFyYWN0ZXJMZXZlbF07XHJcbiAgICAgICAgICAgIHRoaXMuZXhwRm9yTmV4dExldmVsID0gUGxheWVyU3RhdHMuZXhwRm9yTGV2ZWxbdGhpcy5jaGFyYWN0ZXJMZXZlbCArIDFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUV2ZW50KHR5cGUsIHZhbHVlKTtcclxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChTVEFUQ0hBTkdFX1RPUElDLCB0aGlzLnNjZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTdGF0KHR5cGU6IFN0YXRUeXBlKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0c1t0eXBlXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5jcmVhc2VTdGF0KHR5cGU6IFN0YXRUeXBlLCB2YWx1ZTogbnVtYmVyLCBtYXhWYWx1ZT86IG51bWJlcikge1xyXG5cclxuICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnN0YXRzW3R5cGVdICsgdmFsdWU7XHJcbiAgICAgICAgaWYgKG1heFZhbHVlICYmIG5ld1ZhbHVlID4gbWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgbmV3VmFsdWUgPSBtYXhWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld1ZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBuZXdWYWx1ZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUV2ZW50KHR5cGUsIG5ld1ZhbHVlKTtcclxuICAgICAgICB0aGlzLnN0YXRzW3R5cGVdID0gbmV3VmFsdWU7XHJcblxyXG4gICAgICAgIC8vICBzcGVjaWFsIGxvZ2ljIGZvciBleHBlcmllbmNlXHJcbiAgICAgICAgaWYgKHR5cGUgPT09IFN0YXRUeXBlLlRvdGFsRXhwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHNbU3RhdFR5cGUuTGV2ZWxFeHBdID0gbmV3VmFsdWUgLSBQbGF5ZXJTdGF0cy5leHBGb3JMZXZlbFt0aGlzLmNoYXJhY3RlckxldmVsXTtcclxuXHJcbiAgICAgICAgICAgIC8vICBsZXZlbCB1cCBjaGVja1xyXG4gICAgICAgICAgICBpZiAobmV3VmFsdWUgPj0gdGhpcy5leHBGb3JOZXh0TGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyTGV2ZWwgPSBQbGF5ZXJTdGF0cy5maW5kRXhwTGV2ZWwobmV3VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHBGb3JOZXh0TGV2ZWwgPSBQbGF5ZXJTdGF0cy5leHBGb3JMZXZlbFt0aGlzLmNoYXJhY3RlckxldmVsICsgMV07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0c1tTdGF0VHlwZS5MZXZlbE1heEV4cF0gPSB0aGlzLmV4cEZvck5leHRMZXZlbCAtIFBsYXllclN0YXRzLmV4cEZvckxldmVsW3RoaXMuY2hhcmFjdGVyTGV2ZWxdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0c1tTdGF0VHlwZS5MZXZlbEV4cF0gPSBuZXdWYWx1ZSAtIFBsYXllclN0YXRzLmV4cEZvckxldmVsW3RoaXMuY2hhcmFjdGVyTGV2ZWxdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICBsdmwgdXAgZXZlbnRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NldmVudC5UeXBlID0gU3RhdFR5cGUuQ2hhcmFjdGVyTGV2ZWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuT2xkVmFsdWUgPSB0aGlzLmNoYXJhY3RlckxldmVsIC0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NldmVudC5OZXdWYWx1ZSA9IHRoaXMuY2hhcmFjdGVyTGV2ZWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuU3RhdHMgPSB0aGlzLnN0YXRzO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoU1RBVENIQU5HRV9UT1BJQywgdGhpcy5zY2V2ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgYXR0ciBjaGFuZ2UgZXZlbnRcclxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gdGhpcy5zdGF0c1tTdGF0VHlwZS5BdHRyaWJ1dGVQb2ludHNdICsgNTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NldmVudC5UeXBlID0gU3RhdFR5cGUuQXR0cmlidXRlUG9pbnRzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2V2ZW50Lk9sZFZhbHVlID0gdGhpcy5nZXRTdGF0KFN0YXRUeXBlLkF0dHJpYnV0ZVBvaW50cyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuTmV3VmFsdWUgPSBuZXdWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5BdHRyaWJ1dGVQb2ludHMsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NldmVudC5TdGF0cyA9IHRoaXMuc3RhdHM7XHJcbiAgICAgICAgICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChTVEFUQ0hBTkdFX1RPUElDLCB0aGlzLnNjZXZlbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJlZmlsbCBIUCAmIGR1c3RcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5EdXN0LCB0aGlzLnN0YXRzW1N0YXRUeXBlLk1heER1c3RdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdChTdGF0VHlwZS5IUCwgdGhpcy5zdGF0c1tTdGF0VHlwZS5NYXhIUF0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICBwcmVwYXJlIHJlZ3VsYXIgc3RhdCBjaGFuZ2UgZXZlbnQgKGZvciBleHApXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuT2xkVmFsdWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2V2ZW50Lk5ld1ZhbHVlID0gdGhpcy5zdGF0c1tTdGF0VHlwZS5MZXZlbEV4cF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZXZlbnQuU3RhdHMgPSB0aGlzLnN0YXRzO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnNhdmVVc2VyU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChTVEFUQ0hBTkdFX1RPUElDLCB0aGlzLnNjZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgdGhlIGV4cCBsZXZlbCBmb3IgdGhlIGdpdmVuIHRvdGFsIGV4cCB2YWx1ZS5cclxuICAgICAqIEBwYXJhbSBleHBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmaW5kRXhwTGV2ZWwoZXhwOiBudW1iZXIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gUGxheWVyU3RhdHMuZXhwRm9yTGV2ZWwubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGV4cCA8IFBsYXllclN0YXRzLmV4cEZvckxldmVsW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaSAtIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWJ1aWxkU3RhdHMoKSB7XHJcbiAgICAgICAgLy8gIGNhbGMgbWF4ICYgcmVnZW4gc3RhdHNcclxuICAgICAgICB0aGlzLmJhc2VTdGF0c1tCYXNlU3RhdFR5cGUuTWF4SFBdID0gMTUwICsgKHRoaXMuY2hhcmFjdGVyTGV2ZWwgKiAxMCk7XHJcbiAgICAgICAgdGhpcy5iYXNlU3RhdHNbQmFzZVN0YXRUeXBlLk1heER1c3RdID0gNjAwICsgKHRoaXMuY2hhcmFjdGVyTGV2ZWwgKiA1MCk7XHJcbiAgICAgICAgdGhpcy5iYXNlU3RhdHNbQmFzZVN0YXRUeXBlLlJlZ2VuRHVzdF0gPSAyICsgKHRoaXMuY2hhcmFjdGVyTGV2ZWwgLyAyKTtcclxuICAgICAgICB0aGlzLmJhc2VTdGF0c1tCYXNlU3RhdFR5cGUuUmVnZW5IUF0gPSAxICsgKHRoaXMuY2hhcmFjdGVyTGV2ZWwgLyAyKTtcclxuXHJcbiAgICAgICAgLy8gIGVhY2ggbWF4IGF0dHJpYnV0ZSBpbmNyZWFzZXMgYmFzZSBzdGF0IGJ5IDEwJVxyXG4gICAgICAgIHRoaXMuc3RhdHNbU3RhdFR5cGUuTWF4SFBdID0gdGhpcy5iYXNlU3RhdHNbQmFzZVN0YXRUeXBlLk1heEhQXSAqICgxICsgdGhpcy5hdHRyaWJ1dGVTdGF0c1tCYXNlU3RhdFR5cGUuTWF4SFBdLzEwKTtcclxuICAgICAgICB0aGlzLnN0YXRzW1N0YXRUeXBlLk1heER1c3RdID0gdGhpcy5iYXNlU3RhdHNbQmFzZVN0YXRUeXBlLk1heER1c3RdICogKDEgKyB0aGlzLmF0dHJpYnV0ZVN0YXRzW0Jhc2VTdGF0VHlwZS5NYXhEdXN0XSAvIDEwKTtcclxuXHJcbiAgICAgICAgLy8gIGVhY2ggcmVnZW4gYXR0cmlidXRlIGluY3JlYXNlcyBiYXNlIHN0YXQgYnkgMTAlXHJcbiAgICAgICAgdGhpcy5zdGF0c1tTdGF0VHlwZS5SZWdlbkhQXSA9IHRoaXMuYmFzZVN0YXRzW0Jhc2VTdGF0VHlwZS5SZWdlbkhQXSAqICgxICsgdGhpcy5hdHRyaWJ1dGVTdGF0c1tCYXNlU3RhdFR5cGUuUmVnZW5IUF0gLyAxMCk7XHJcbiAgICAgICAgdGhpcy5zdGF0c1tTdGF0VHlwZS5SZWdlbkR1c3RdID0gdGhpcy5iYXNlU3RhdHNbQmFzZVN0YXRUeXBlLlJlZ2VuRHVzdF0gKiAoMSArIHRoaXMuYXR0cmlidXRlU3RhdHNbQmFzZVN0YXRUeXBlLlJlZ2VuRHVzdF0gLyAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2V2ZW50OiBJU3RhdENoYW5nZUV2ZW50ID0ge1xyXG4gICAgICAgIFR5cGU6IFN0YXRUeXBlLkNvaW5zLFxyXG4gICAgICAgIE9sZFZhbHVlOiAwLFxyXG4gICAgICAgIE5ld1ZhbHVlOiAwLFxyXG4gICAgICAgIFN0YXRzOiBbXVxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZUV2ZW50KHR5cGU6IFN0YXRUeXBlLCBuZXdWYWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zY2V2ZW50LlR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuc2NldmVudC5PbGRWYWx1ZSA9IHRoaXMuc3RhdHNbdHlwZV07XHJcbiAgICAgICAgdGhpcy5zY2V2ZW50Lk5ld1ZhbHVlID0gbmV3VmFsdWU7XHJcbiAgICAgICAgdGhpcy5zY2V2ZW50LlN0YXRzID0gdGhpcy5zdGF0cztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBzdGF0cyA9IG5ldyBQbGF5ZXJTdGF0cygpOyIsImltcG9ydCAqIGFzIHBhcnRpY2xlcyBmcm9tIFwicGl4aS1wYXJ0aWNsZXNcIjtcclxuaW1wb3J0ICogYXMgVFdFRU4gZnJvbSBcIkB0d2VlbmpzL3R3ZWVuLmpzXCI7XHJcbmltcG9ydCB7IEdsb2JhbCwgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgY3JlYXRlUGFydGljbGVFbWl0dGVyIH0gZnJvbSAnLi4vZ2xvYmFsJztcclxuaW1wb3J0IHsgc3RhdHMgfSBmcm9tICcuL1BsYXllclN0YXRzJztcclxuaW1wb3J0IHsgZXZlbnRFbWl0dGVyLCBTVEFUQ0hBTkdFX1RPUElDLCBEQU1BR0VfVE9QSUMsIElTdGF0Q2hhbmdlRXZlbnQsIElEcHNDaGFuZ2VFdmVudCB9IGZyb20gJy4uL2V2ZW50cyc7XHJcbmltcG9ydCB7IFNDRU5FX0hBTEZfV0lEVEgsIFRFWFRfU1RZTEUsIFNDRU5FX0hFSUdIVCwgU0NFTkVfSEFMRl9IRUlHSFQsIEVYUF9CQVJfU1RZTEUsIE1TR19IUF9TVFlMRSwgUVVFU1RfSVRFTV9TVFlMRSwgU0NFTkVfV0lEVEgsIFFVRVNUX1NUWUxFLCBHVUlfRk9OVCwgTVNHX0VYUF9TVFlMRSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IFN0YXRUeXBlIH0gZnJvbSAnLi4vZW51bXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFN0YXRzSHVkIGV4dGVuZHMgUElYSS5Db250YWluZXIge1xyXG4gICAgcHJpdmF0ZSB0eHRIUDogUElYSS5UZXh0O1xyXG4gICAgcHJpdmF0ZSB0eHREdXN0OiBQSVhJLlRleHQ7XHJcbiAgICBwcml2YXRlIHR4dENvaW5zOiBQSVhJLlRleHQ7XHJcbiAgICBwcml2YXRlIHR4dEV4cDogUElYSS5UZXh0O1xyXG4gICAgcHJpdmF0ZSB0eHRMZXZlbDogUElYSS5UZXh0O1xyXG4gICAgcHJpdmF0ZSBleHBQcmVGaWxsZXI6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHJpdmF0ZSBleHBGaWxsZXI6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHJpdmF0ZSBmaWxsTGVuOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBlbWl0dGVyOiBwYXJ0aWNsZXMuRW1pdHRlcjtcclxuXHJcbiAgICBwcml2YXRlIHBhbmVsOiBQSVhJLlNwcml0ZTtcclxuICAgIHByaXZhdGUgdHh0UXVlc3RNZXNzYWdlOiBQSVhJLlRleHQ7XHJcbiAgICBwcml2YXRlIHF1ZXN0TXNnRW5kVGltZSA9IDA7XHJcbiAgICBwcml2YXRlIG9uQ29tcGxldGVDQj86ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgcHJpdmF0ZSB0eHRQbGF5ZXJQb3NpdGlvbjogUElYSS5UZXh0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXAoKSB7XHJcbiAgICAgICAgLy8gIFRPRE86IHJlbW92ZSBvciBtYWtlIGEgaHVkIGZvciBwbGF5ZXIgcG9zaXRpb25cclxuICAgICAgICB0aGlzLnR4dFBsYXllclBvc2l0aW9uID0gbmV3IFBJWEkuVGV4dChcIlwiLCBRVUVTVF9TVFlMRSk7XHJcbiAgICAgICAgdGhpcy50eHRQbGF5ZXJQb3NpdGlvbi5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KFNDRU5FX1dJRFRILCBTQ0VORV9IRUlHSFQpO1xyXG4gICAgICAgIHRoaXMudHh0UGxheWVyUG9zaXRpb24uYW5jaG9yLnNldCgxLCAxKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMudHh0UGxheWVyUG9zaXRpb24pO1xyXG5cclxuICAgICAgICAvLyAgY2FsbG91dCBmb3IgcXVlc3QgbWVzc2FnZVxyXG4gICAgICAgIHRoaXMucGFuZWwgPSBuZXcgUElYSS5TcHJpdGUoVGV4dHVyZUxvYWRlci5HZXQoXCJhc3NldHMvZ3VpLWF0bGFzLmpzb25AcGFuZWwucG5nXCIpKTtcclxuICAgICAgICAvL3RoaXMucGFuZWwudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLlNDQUxFX01PREVTLk5FQVJFU1Q7XHJcbiAgICAgICAgdGhpcy5wYW5lbC5wb3NpdGlvbi5zZXQoNCk7XHJcbiAgICAgICAgdGhpcy5wYW5lbC5uYW1lID0gXCJUcmlnZ2VyTWVzc2FnZVwiO1xyXG4gICAgICAgIHRoaXMucGFuZWwuYW5jaG9yLnNldCgwKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMucGFuZWwpO1xyXG5cclxuICAgICAgICB0aGlzLnR4dFF1ZXN0TWVzc2FnZSA9IG5ldyBQSVhJLlRleHQoXCJcIiwgUVVFU1RfU1RZTEUpO1xyXG4gICAgICAgIHRoaXMudHh0UXVlc3RNZXNzYWdlLnBvc2l0aW9uLnNldCgzODQsIDEwMCk7XHJcbiAgICAgICAgdGhpcy50eHRRdWVzdE1lc3NhZ2UuYW5jaG9yLnNldCgwLjUsIDApO1xyXG4gICAgICAgIHRoaXMucGFuZWwuYWRkQ2hpbGQodGhpcy50eHRRdWVzdE1lc3NhZ2UpO1xyXG5cclxuICAgICAgICBsZXQgeTogbnVtYmVyID0gNTtcclxuICAgICAgICAvLyAgSFBcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG5sID0gbmV3IFBJWEkuU3ByaXRlKFRleHR1cmVMb2FkZXIuR2V0KFwiYXNzZXRzL2d1aS1hdGxhcy5qc29uQHN0YXRfcGFuZWwucG5nXCIpKTtcclxuICAgICAgICAgICAgLy9wbmwudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLlNDQUxFX01PREVTLkxJTkVBUjtcclxuICAgICAgICAgICAgcG5sLnBvc2l0aW9uLnNldCg1LCB5KTtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbC5hZGRDaGlsZChwbmwpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50eHRIUCA9IG5ldyBQSVhJLlRleHQoXCIwXCIsIFRFWFRfU1RZTEUpO1xyXG4gICAgICAgICAgICB0aGlzLnR4dEhQLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoNzAsIHkgKyAxMCk7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZCh0aGlzLnR4dEhQKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzcHIgPSBuZXcgUElYSS5TcHJpdGUoVGV4dHVyZUxvYWRlci5HZXQoXCJhc3NldHMvZ3VpLWF0bGFzLmpzb25AaGVhcnQucG5nXCIpKTtcclxuICAgICAgICAgICAgc3ByLnBvc2l0aW9uLnNldCg4LCB5ICsgNCk7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZChzcHIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gIHBpeGkgZHVzdFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9sZXQgeSA9IDc1O1xyXG4gICAgICAgICAgICBsZXQgcG5sID0gbmV3IFBJWEkuU3ByaXRlKFRleHR1cmVMb2FkZXIuR2V0KFwiYXNzZXRzL2d1aS1hdGxhcy5qc29uQHN0YXRfcGFuZWwucG5nXCIpKTtcclxuICAgICAgICAgICAgLy9wbmwudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUgPSBQSVhJLlNDQUxFX01PREVTLkxJTkVBUjtcclxuICAgICAgICAgICAgcG5sLnBvc2l0aW9uLnNldCgyNjEsIHkpO1xyXG4gICAgICAgICAgICB0aGlzLnBhbmVsLmFkZENoaWxkKHBubCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnR4dER1c3QgPSBuZXcgUElYSS5UZXh0KFwiMFwiLCBURVhUX1NUWUxFKTtcclxuICAgICAgICAgICAgdGhpcy50eHREdXN0LnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoNzAsIHkgKyAxMCk7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZCh0aGlzLnR4dER1c3QpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbWl0dGVyID0gY3JlYXRlUGFydGljbGVFbWl0dGVyKHBubCwgW1RleHR1cmVMb2FkZXIuR2V0KFwiYXNzZXRzL3N0YXIucG5nXCIpXSk7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci51cGRhdGVPd25lclBvcygzMiwgNTUpO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIubWF4TGlmZXRpbWUgPSAwLjY7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5tYXhQYXJ0aWNsZXMgPSA1MDtcclxuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gIGNvaW5zXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL2xldCB5ID0gMTQ1O1xyXG5cclxuICAgICAgICAgICAgbGV0IHBubCA9IG5ldyBQSVhJLlNwcml0ZShUZXh0dXJlTG9hZGVyLkdldChcImFzc2V0cy9ndWktYXRsYXMuanNvbkBzdGF0X3BhbmVsLnBuZ1wiKSk7XHJcbiAgICAgICAgICAgIC8vcG5sLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlID0gUElYSS5TQ0FMRV9NT0RFUy5MSU5FQVI7XHJcbiAgICAgICAgICAgIHBubC5wb3NpdGlvbi5zZXQoNTE3LCB5KTtcclxuICAgICAgICAgICAgdGhpcy5wYW5lbC5hZGRDaGlsZChwbmwpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50eHRDb2lucyA9IG5ldyBQSVhJLlRleHQoXCIwXCIsIFRFWFRfU1RZTEUpO1xyXG4gICAgICAgICAgICB0aGlzLnR4dENvaW5zLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoNzAsIHkgKyAxMCk7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZCh0aGlzLnR4dENvaW5zKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzcHIgPSBuZXcgUElYSS5TcHJpdGUoVGV4dHVyZUxvYWRlci5HZXQoXCJhc3NldHMvZ3VpLWF0bGFzLmpzb25AY29pbi5wbmdcIikpO1xyXG4gICAgICAgICAgICBzcHIucG9zaXRpb24uc2V0KDgsIHkgKyA0KTtcclxuICAgICAgICAgICAgcG5sLmFkZENoaWxkKHNwcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgRXhwXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgcG5sID0gbmV3IFBJWEkuU3ByaXRlKFRleHR1cmVMb2FkZXIuR2V0KFwiYXNzZXRzL2d1aS1hdGxhcy5qc29uQGV4cF9wYW5lbC5wbmdcIikpO1xyXG4gICAgICAgICAgICAvL3BubC50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSA9IFBJWEkuU0NBTEVfTU9ERVMuTElORUFSO1xyXG4gICAgICAgICAgICBwbmwucG9zaXRpb24uc2V0KDAsIFNDRU5FX0hFSUdIVCAtIHBubC5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKHBubCk7XHJcblxyXG4gICAgICAgICAgICAvLyAgcHJlIGZpbGxlciByZWN0XHJcbiAgICAgICAgICAgIHRoaXMuZXhwUHJlRmlsbGVyID0gbmV3IFBJWEkuU3ByaXRlKFRleHR1cmVMb2FkZXIuR2V0KFwiYXNzZXRzL2d1aS1hdGxhcy5qc29uQGV4cF9wcmVmaWxsLnBuZ1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwUHJlRmlsbGVyLnBvc2l0aW9uLnNldCgzLCAzKTtcclxuICAgICAgICAgICAgcG5sLmFkZENoaWxkKHRoaXMuZXhwUHJlRmlsbGVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vICBmaWxsZXIgcmVjdFxyXG4gICAgICAgICAgICB0aGlzLmV4cEZpbGxlciA9IG5ldyBQSVhJLlNwcml0ZShUZXh0dXJlTG9hZGVyLkdldChcImFzc2V0cy9ndWktYXRsYXMuanNvbkBleHBfZmlsbC5wbmdcIikpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cEZpbGxlci5wb3NpdGlvbi5zZXQoMywgMyk7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZCh0aGlzLmV4cEZpbGxlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsbExlbiA9IHBubC53aWR0aCAtIDY7IC8vIDMgcGl4ZWxzIGZvciBsZWZ0L3JpZ2h0IGJvcmRlcjtcclxuXHJcblxyXG4gICAgICAgICAgICB0aGlzLnR4dEV4cCA9IG5ldyBQSVhJLlRleHQoXCIwIC8gMTAwMFwiLCBFWFBfQkFSX1NUWUxFKTtcclxuICAgICAgICAgICAgdGhpcy50eHRFeHAucGl2b3Quc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIHRoaXMudHh0RXhwLmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICAgICAgdGhpcy50eHRFeHAucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChwbmwud2lkdGggLyAyLCBwbmwuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIHBubC5hZGRDaGlsZCh0aGlzLnR4dEV4cCk7XHJcblxyXG4gICAgICAgICAgICAvLyAgY2hhcmFjdGVyIGxldmVsXHJcbiAgICAgICAgICAgIHRoaXMudHh0TGV2ZWwgPSBuZXcgUElYSS5UZXh0KGBMZXZlbCAke3N0YXRzLmNoYXJhY3RlckxldmVsfWAsIFRFWFRfU1RZTEUpO1xyXG4gICAgICAgICAgICB0aGlzLnR4dExldmVsLmFuY2hvci5zZXQoMCwgMC4yKTtcclxuICAgICAgICAgICAgdGhpcy50eHRMZXZlbC5wb3NpdGlvbi5zZXQocG5sLnggKyBwbmwud2lkdGggKyA0LCBwbmwueSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50eHRMZXZlbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudEVtaXR0ZXIub24oU1RBVENIQU5HRV9UT1BJQywgdGhpcy5oYW5kbGVTdGF0Q2hhbmdlKTtcclxuICAgICAgICBldmVudEVtaXR0ZXIub24oREFNQUdFX1RPUElDLCB0aGlzLmhhbmRsZURwc0NoYW5nZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlKGR0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmVtaXR0ZXIudXBkYXRlKGR0ICogMC4wMDEpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50eHRRdWVzdE1lc3NhZ2UudmlzaWJsZSAmJiB0aGlzLnF1ZXN0TXNnRW5kVGltZSA8IHBlcmZvcm1hbmNlLm5vdygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHh0UXVlc3RNZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub25Db21wbGV0ZUNCKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ29tcGxldGVDQigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnR4dFBsYXllclBvc2l0aW9uLnRleHQgPSBgJHtHbG9iYWwucG9zaXRpb24ueC50b0ZpeGVkKDApfSwgJHtHbG9iYWwucG9zaXRpb24ueS50b0ZpeGVkKDApfWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydHMgYW4gYW5pbWF0aW9uIHR3ZWVuIHdpdGggaW5mb3JtYXRpb25hbCB0ZXh0IG1vdmluZyB1cHdhcmRzIGZyb20gdGhlIGdpdmVuIHBvc2l0aW9uLlxyXG4gICAgICogQHBhcmFtIHBvc2l0aW9uIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgbWVzc2FnZVxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgdGhlIG1lc3NhZ2UgdG8gYmUgYWRkZWRcclxuICAgICAqIEBwYXJhbSBzdHlsZSBvcHRpb25hbCBQSVhJLklUZXh0U3R5bGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZEluZm9NZXNzYWdlKHBvc2l0aW9uOiBQSVhJLlBvaW50TGlrZSB8IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSwgbWVzc2FnZTogc3RyaW5nLCBzdHlsZT86IFBJWEkuVGV4dFN0eWxlT3B0aW9ucywgb2Zmc2V0WD86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHZhciBzdGwgPSBzdHlsZSB8fCBURVhUX1NUWUxFO1xyXG4gICAgICAgIHZhciB0eHRJbmZvID0gbmV3IFBJWEkuVGV4dChtZXNzYWdlLCBzdGwpO1xyXG4gICAgICAgIG9mZnNldFggPSBvZmZzZXRYIHx8IDA7XHJcbiAgICAgICAgdHh0SW5mby5wb3NpdGlvbi5zZXQoU0NFTkVfSEFMRl9XSURUSCArIG9mZnNldFgsIFNDRU5FX0hFSUdIVCAtIHBvc2l0aW9uLnkgLSA3MCk7XHJcbiAgICAgICAgdHh0SW5mby5zY2FsZS5zZXQoMSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQodHh0SW5mbyk7XHJcblxyXG4gICAgICAgIHZhciBkeSA9IChwb3NpdGlvbi55ID4gU0NFTkVfSEFMRl9IRUlHSFQpID8gMjUwIDogLTI1MDtcclxuICAgICAgICB2YXIgdXBZID0gU0NFTkVfSEVJR0hUIC0gcG9zaXRpb24ueSArIGR5O1xyXG4gICAgICAgIHZhciBtb3ZlVXAgPSBuZXcgVFdFRU4uVHdlZW4odHh0SW5mby5wb3NpdGlvbilcclxuICAgICAgICAgICAgLnRvKHsgeTogdXBZIH0sIDIwMDApO1xyXG4gICAgICAgIG1vdmVVcC5zdGFydCgpO1xyXG5cclxuICAgICAgICB2YXIgc2NhbGUgPSBuZXcgVFdFRU4uVHdlZW4odHh0SW5mby5zY2FsZSlcclxuICAgICAgICAgICAgLnRvKHsgeDogMS42LCB5OiAxLjYgfSwgMjIwMClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuTGluZWFyLk5vbmUpO1xyXG5cclxuICAgICAgICB2YXIgZmFkZSA9IG5ldyBUV0VFTi5Ud2Vlbih0eHRJbmZvKVxyXG4gICAgICAgICAgICAudG8oeyBhbHBoYTogMCB9LCAzMDAwKVxyXG4gICAgICAgICAgICAub25Db21wbGV0ZSgoKSA9PiB0aGlzLnJlbW92ZUNoaWxkKHR4dEluZm8pKTtcclxuICAgICAgICBzY2FsZS5jaGFpbihmYWRlKS5zdGFydCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0ZXh0IG1lc3NhZ2UgYWJvdXQgYWNxdWlyZWQgcXVlc3QgaXRlbXMuXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB0aGUgbWVzc2FnZSB0byBiZSBhZGRlZFxyXG4gICAgICogQHBhcmFtIHN0eWxlIG9wdGlvbmFsIFBJWEkuSVRleHRTdHlsZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkUXVlc3RJdGVtTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIHN0eWxlPzogUElYSS5UZXh0U3R5bGUpOiB2b2lkIHtcclxuICAgICAgICB2YXIgc3RsID0gc3R5bGUgfHwgUVVFU1RfSVRFTV9TVFlMRTtcclxuICAgICAgICB2YXIgdHh0SW5mbyA9IG5ldyBQSVhJLlRleHQobWVzc2FnZSwgc3RsKTtcclxuICAgICAgICB0eHRJbmZvLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHR4dEluZm8ucG9zaXRpb24uc2V0KFNDRU5FX0hBTEZfV0lEVEgsIDE1MCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQodHh0SW5mbyk7XHJcblxyXG4gICAgICAgIHZhciBzY2FsZSA9IG5ldyBUV0VFTi5Ud2Vlbih0eHRJbmZvLnNjYWxlKVxyXG4gICAgICAgICAgICAudG8oeyB4OiAxLjgsIHk6IDEuOCB9LCAyMjAwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSk7XHJcblxyXG4gICAgICAgIHZhciBmYWRlID0gbmV3IFRXRUVOLlR3ZWVuKHR4dEluZm8pXHJcbiAgICAgICAgICAgIC50byh7IGFscGhhOiAwIH0sIDMwMDApXHJcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlKCgpID0+IHRoaXMucmVtb3ZlQ2hpbGQodHh0SW5mbykpO1xyXG4gICAgICAgIHNjYWxlLmNoYWluKGZhZGUpLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwbGF5cyB0aGUgcXVlc3QgbWVzc2FnZSBpbiB0aGUgcXVlc3QgcmVjdGFuZ2xlLlxyXG4gICAgICogQHBhcmFtIG1zZ1xyXG4gICAgICogQHBhcmFtIHR0bE1pbGlzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRRdWVzdE1lc3NhZ2UobXNnOiBzdHJpbmcsIHR0bE1pbGlzOiBudW1iZXIgPSA4MDAwLCBvbkNvbXBsZXRlQ0I6ICgpID0+IHZvaWQgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50eHRRdWVzdE1lc3NhZ2UudGV4dCA9IG1zZztcclxuICAgICAgICB0aGlzLnBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudHh0UXVlc3RNZXNzYWdlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucXVlc3RNc2dFbmRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCkgKyB0dGxNaWxpcztcclxuICAgICAgICB0aGlzLm9uQ29tcGxldGVDQiA9IG9uQ29tcGxldGVDQjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBhbiBhbmltYXRpb24gdHdlZW4gd2l0aCBsZXZlbCB1cCBtZXNzYWdlLlxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgdGhlIG1lc3NhZ2UgdG8gYmUgYWRkZWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGRMdmxVcE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdmFyIHN0bDogUElYSS5UZXh0U3R5bGVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgICAgICAgICAgcGFkZGluZzogMCxcclxuICAgICAgICAgICAgZm9udFNpemU6IFwiNjRweFwiLFxyXG4gICAgICAgICAgICBmb250RmFtaWx5OiBHVUlfRk9OVCxcclxuICAgICAgICAgICAgZmlsbDogMHgzMzU1MzMsXHJcbiAgICAgICAgICAgIHN0cm9rZVRoaWNrbmVzczogNixcclxuICAgICAgICAgICAgc3Ryb2tlOiAweGNjY2NmZlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciB0eHRJbmZvID0gbmV3IFBJWEkuVGV4dChtZXNzYWdlLCBzdGwpO1xyXG4gICAgICAgIHR4dEluZm8uc2NhbGUuc2V0KDEpO1xyXG4gICAgICAgIHR4dEluZm8uYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgIHR4dEluZm8ucG9zaXRpb24uc2V0KFNDRU5FX0hBTEZfV0lEVEgsIFNDRU5FX0hFSUdIVCAtIEdsb2JhbC5wb3NpdGlvbi55IC0gNzApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQodHh0SW5mbyk7XHJcblxyXG4gICAgICAgIHZhciBkeSA9IChHbG9iYWwucG9zaXRpb24ueSA+IFNDRU5FX0hBTEZfSEVJR0hUKSA/IDQ1MCA6IC00NTA7XHJcbiAgICAgICAgdmFyIHVwWSA9IFNDRU5FX0hFSUdIVCAtIEdsb2JhbC5wb3NpdGlvbi55ICsgZHk7XHJcbiAgICAgICAgdmFyIG1vdmVVcCA9IG5ldyBUV0VFTi5Ud2Vlbih0eHRJbmZvLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAudG8oeyB5OiB1cFkgfSwgMjAwMCk7XHJcbiAgICAgICAgbW92ZVVwLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgIHZhciBzY2FsZSA9IG5ldyBUV0VFTi5Ud2Vlbih0eHRJbmZvLnNjYWxlKVxyXG4gICAgICAgICAgICAudG8oeyB4OiAxLjYsIHk6IDEuNiB9LCAxNTAwKVxyXG4gICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZSk7XHJcblxyXG4gICAgICAgIHZhciBmYWRlID0gbmV3IFRXRUVOLlR3ZWVuKHR4dEluZm8pXHJcbiAgICAgICAgICAgIC50byh7IGFscGhhOiAwLjQgfSwgNjAwMClcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4gdGhpcy5yZW1vdmVDaGlsZCh0eHRJbmZvKSk7XHJcbiAgICAgICAgc2NhbGUuY2hhaW4oZmFkZSkuc3RhcnQoKTtcclxuICAgIH0gICAgXHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVEcHNDaGFuZ2UgPSAoZXZlbnQ6IElEcHNDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWRkSW5mb01lc3NhZ2UoR2xvYmFsLnBvc2l0aW9uLCBgJHtldmVudC5BbW91bnR9IEhQYCwgTVNHX0hQX1NUWUxFLCA1MCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlU3RhdENoYW5nZSA9IChldmVudDogSVN0YXRDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFN0YXRUeXBlLkNvaW5zOlxyXG4gICAgICAgICAgICAgICAgdGhpcy50eHRDb2lucy50ZXh0ID0gZXZlbnQuTmV3VmFsdWUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFN0YXRUeXBlLkR1c3Q6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnR4dER1c3QudGV4dCA9IGAke2V2ZW50Lk5ld1ZhbHVlLnRvRml4ZWQoMCl9IC8gJHtldmVudC5TdGF0c1tTdGF0VHlwZS5NYXhEdXN0XS50b0ZpeGVkKDApfWA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBTdGF0VHlwZS5NYXhEdXN0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy50eHREdXN0LnRleHQgPSBgJHtNYXRoLmZsb29yKGV2ZW50LlN0YXRzW1N0YXRUeXBlLkR1c3RdKX0gLyAke2V2ZW50Lk5ld1ZhbHVlLnRvRml4ZWQoMCl9YDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFN0YXRUeXBlLkhQOlxyXG4gICAgICAgICAgICAgICAgdGhpcy50eHRIUC50ZXh0ID0gYCR7TWF0aC5yb3VuZChldmVudC5OZXdWYWx1ZSl9IC8gJHtldmVudC5TdGF0c1tTdGF0VHlwZS5NYXhIUF19YDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFN0YXRUeXBlLk1heEhQOlxyXG4gICAgICAgICAgICAgICAgdGhpcy50eHRIUC50ZXh0ID0gYCR7TWF0aC5yb3VuZChldmVudC5TdGF0c1tTdGF0VHlwZS5IUF0pfSAvICR7ZXZlbnQuTmV3VmFsdWV9YDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFN0YXRUeXBlLlRvdGFsRXhwOlxyXG4gICAgICAgICAgICAgICAgbGV0IGV4cCA9IGV2ZW50Lk5ld1ZhbHVlIC0gZXZlbnQuT2xkVmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXhwICE9IDApXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRJbmZvTWVzc2FnZSh7IHg6IDAsIHk6IDkwIH0sIGArJHtleHB9IGV4cGAsIE1TR19FWFBfU1RZTEUsIC01MCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckV4cChldmVudCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBTdGF0VHlwZS5DaGFyYWN0ZXJMZXZlbDpcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTGV2ZWxVcChldmVudCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIGNhc2UgU3RhdFR5cGUuQXR0cmlidXRlUG9pbnRzOlxyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jaGFyYWN0ZXJNbmdyLnZpc2libGUgPSBldmVudC5OZXdWYWx1ZSA+IDA7XHJcbiAgICAgICAgICAgIC8vICAgICB0aGlzLnR4dEF0clB0cy52aXNpYmxlID0gZXZlbnQuTmV3VmFsdWUgPiAwO1xyXG4gICAgICAgICAgICAvLyAgICAgLy90aGlzLnR4dEF0clB0cy50ZXh0ID0gXCJwb2ludHMgYXZhaWxhYmxlXCI7XHJcbiAgICAgICAgICAgIC8vICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVMZXZlbFVwID0gKGV2ZW50OiBJU3RhdENoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgdGhpcy50eHRFeHAudGV4dCA9IGAke01hdGgucm91bmQoZXZlbnQuU3RhdHNbU3RhdFR5cGUuTGV2ZWxFeHBdKX0gLyAke2V2ZW50LlN0YXRzW1N0YXRUeXBlLkxldmVsTWF4RXhwXX1gO1xyXG4gICAgICAgIHRoaXMuZXhwRmlsbGVyLndpZHRoID0gMTtcclxuICAgICAgICB0aGlzLmFkZEx2bFVwTWVzc2FnZShcIkxldmVsIFwiICsgZXZlbnQuTmV3VmFsdWUpO1xyXG4gICAgICAgIHRoaXMudHh0TGV2ZWwudGV4dCA9IGBMZXZlbCAke3N0YXRzLmNoYXJhY3RlckxldmVsfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgcmVuZGVyRXhwKGV2ZW50OiBJU3RhdENoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy50eHRFeHAudGV4dCA9IGAke01hdGgucm91bmQoZXZlbnQuU3RhdHNbU3RhdFR5cGUuTGV2ZWxFeHBdKX0gLyAke2V2ZW50LlN0YXRzW1N0YXRUeXBlLkxldmVsTWF4RXhwXX1gO1xyXG4gICAgICAgIHRoaXMudHh0TGV2ZWwudGV4dCA9IGBMZXZlbCAke3N0YXRzLmNoYXJhY3RlckxldmVsfWA7XHJcblxyXG4gICAgICAgIHZhciBwY3QgPSBNYXRoLm1pbihldmVudC5TdGF0c1tTdGF0VHlwZS5MZXZlbEV4cF0gLyBldmVudC5TdGF0c1tTdGF0VHlwZS5MZXZlbE1heEV4cF0sIDEuMCk7XHJcblxyXG4gICAgICAgIC8vICBzcGVjaWFsIGNhc2UgZHVyaW5nIGxldmVsIHVwXHJcbiAgICAgICAgaWYgKHBjdCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cEZpbGxlci53aWR0aCA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwUHJlRmlsbGVyLnBvc2l0aW9uLnggPSAxICsgdGhpcy5leHBGaWxsZXIueDtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5leHBQcmVGaWxsZXIucG9zaXRpb24ueCA9IHRoaXMuZXhwRmlsbGVyLndpZHRoICsgdGhpcy5leHBGaWxsZXIueDtcclxuICAgICAgICB2YXIgdGFyZ2V0V2lkdGggPSAodGhpcy5maWxsTGVuICogcGN0KSB8IDA7XHJcblxyXG4gICAgICAgIHZhciBkaWZmID0gdGFyZ2V0V2lkdGggLSB0aGlzLmV4cEZpbGxlci53aWR0aDtcclxuXHJcbiAgICAgICAgLy8gIHR3ZWVuIHByZS1maWxsIHdpZHRoXHJcbiAgICAgICAgdGhpcy5leHBQcmVGaWxsZXIud2lkdGggPSAxO1xyXG4gICAgICAgIHZhciBwcmVGaWxsVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGhpcy5leHBQcmVGaWxsZXIpXHJcbiAgICAgICAgICAgIC50byh7IHdpZHRoOiBkaWZmIH0sIDE1MDApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lKTtcclxuXHJcbiAgICAgICAgdmFyIGZpbGxUd2VlbiA9IG5ldyBUV0VFTi5Ud2Vlbih0aGlzLmV4cEZpbGxlcilcclxuICAgICAgICAgICAgLnRvKHsgd2lkdGg6IHRhcmdldFdpZHRoIH0sIDIwMDApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQpO1xyXG4gICAgICAgIHByZUZpbGxUd2Vlbi5jaGFpbihmaWxsVHdlZW4pLnN0YXJ0KCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgKiBhcyBHbG9iYWwgZnJvbSBcIi4uL2dsb2JhbFwiO1xyXG5pbXBvcnQgeyBRdWVzdFN0YXRlIH0gZnJvbSBcIi4vUXVlc3RTdGF0ZVwiO1xyXG5pbXBvcnQgeyBRdWVzdCB9IGZyb20gXCIuL1F1ZXN0XCI7XHJcbmltcG9ydCB7IElUcmlnZ2VyRGVmaW5pdGlvbiB9IGZyb20gXCIuLi93b3JsZC9MZXZlbEludGVyZmFjZXNcIjtcclxuaW1wb3J0IHsgTWFpblNjZW5lIH0gZnJvbSBcIi4uL1NjZW5lcy9NYWluU2NlbmVcIjtcclxuaW1wb3J0IHsgQ3V0U2NlbmUgfSBmcm9tIFwiLi4vU2NlbmVzL0N1dFNjZW5lXCI7XHJcbmltcG9ydCB7IHN0YXRzIH0gZnJvbSBcIi4uL29iamVjdHMvUGxheWVyU3RhdHNcIjtcclxuaW1wb3J0IHsgU3RhdHNIdWQgfSBmcm9tIFwiLi4vb2JqZWN0cy9TdGF0c0h1ZFwiO1xyXG5pbXBvcnQgeyB3cDIgfSBmcm9tICcuLi93b3JsZC9Xb3JsZFAyJztcclxuaW1wb3J0IHsgc25kIH0gZnJvbSAnLi4vd29ybGQvU291bmRNYW4nO1xyXG5pbXBvcnQgeyBRVUVTVF9TVFlMRSB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgU3RhdFR5cGUgfSBmcm9tICcuLi9lbnVtcyc7XHJcblxyXG4vKipcclxuICogQ29udGFpbnMgcXVlc3QgcmVsYXRlZCBsb2dpYywgY2hlY2tzIGFuZCBoZWxwZXJzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFF1ZXN0TWFuYWdlciB7XHJcbiAgICBwcml2YXRlIHF1ZXN0U3RhdGU6IEFycmF5PFF1ZXN0U3RhdGU+ID0gW107XHJcbiAgICBwcml2YXRlIGh1ZDogU3RhdHNIdWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBnYW1lU2NlbmU6IE1haW5TY2VuZSkge1xyXG4gICAgICAgIHRoaXMuaHVkID0gdGhpcy5nYW1lU2NlbmUuSHVkT3ZlcmxheSBhcyBTdGF0c0h1ZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2V0cyBzdGF0ZSBvZiBhbGwgcXVlc3RzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5xdWVzdFN0YXRlLmZvckVhY2goKHFzLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocXMgIT0gUXVlc3RTdGF0ZS5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlc3QgPSB0aGlzLmZpbmRRdWVzdChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICBxdWVzdC5pdGVtc0NvbGxlY3RlZCAgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5xdWVzdFN0YXRlID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBpdGVtSWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFjcXVpcmVJdGVtKGl0ZW1JZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gIGZpbmQgaWYgdGhlcmUgaXMgYW4gdW5maW5pc2hlZCBxdWVzdCBkZXBlbmRpbmcgb24gdGhhdCBpdGVtXHJcbiAgICAgICAgbGV0IHF1ZXN0ID0gdGhpcy5maW5kUXVlc3RXaXRoSXRlbShpdGVtSWQpO1xyXG4gICAgICAgIGlmIChxdWVzdCkge1xyXG4gICAgICAgICAgICBxdWVzdC5pdGVtc0NvbGxlY3RlZCsrO1xyXG4gICAgICAgICAgICB0aGlzLmh1ZC5hZGRRdWVzdEl0ZW1NZXNzYWdlKGBjb2xsZWN0ZWQgJHtxdWVzdC5pdGVtc0NvbGxlY3RlZH0gLyAke3F1ZXN0Lml0ZW1zTmVlZGVkfWApO1xyXG4gICAgICAgICAgICBpZiAocXVlc3QuaXRlbXNDb2xsZWN0ZWQgPj0gcXVlc3QuaXRlbXNOZWVkZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZShxdWVzdC5pZCwgUXVlc3RTdGF0ZS5Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXN0LmNvbXBsZXRlZE1zZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaHVkLnNldFF1ZXN0TWVzc2FnZShxdWVzdC5jb21wbGV0ZWRNc2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIGEgdHJpZ2dlciBjYW4gYmUgYWN0aXZhdGVkLiBcclxuICAgICAqIEBwYXJhbSB0cmlnZ2VyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjYW5BY3RpdmF0ZVRyaWdnZXIodHJpZ2dlcjogSVRyaWdnZXJEZWZpbml0aW9uKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0cmlnZ2VyIHx8ICF0cmlnZ2VyLnF1ZXN0SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gIGNoZWNrIGlmIHRyaWdnZXIgZGVwZW5kcyBvbiBxdWVzdCBcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmlnZ2VyLmRlcGVuZHNPbikpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmlnZ2VyLmRlcGVuZHNPbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlcGVuZGVuY3kgPSB0cmlnZ2VyLmRlcGVuZHNPbltpXTtcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0ZSA9IHRoaXMucXVlc3RTdGF0ZVtkZXBlbmRlbmN5XTtcclxuICAgICAgICAgICAgICAgIGlmICghc3RhdGUgfHwgc3RhdGUgIT0gUXVlc3RTdGF0ZS5SZXdhcmRlZClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBURU5fU0VDT05EUyA9IDEwMDAwO1xyXG4gICAgICAgIGxldCBuZXh0QWxsb3dlZFRpbWUgPSAodHJpZ2dlci5sYXN0QWN0aXZlIHx8IC1URU5fU0VDT05EUykgKyBURU5fU0VDT05EUztcclxuICAgICAgICByZXR1cm4gbmV4dEFsbG93ZWRUaW1lIDwgcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGxldmVsIGV2ZW50cyB0cmlnZ2Vycy5cclxuICAgICAqIEBwYXJhbSBib2R5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBoYW5kbGVUcmlnZ2VyRXZlbnQoYm9keTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNjbSA9IEdsb2JhbC5nZXRTY20oKTtcclxuICAgICAgICB2YXIgdHJpZ2dlcjogSVRyaWdnZXJEZWZpbml0aW9uID0gYm9keS5UcmlnZ2VyO1xyXG5cclxuICAgICAgICAvLyAgbm90ZTogdHJpZ2dlciBjYW4gaGF2ZSBhIHByZWRlZmluZWQgc3RhdGUgKHNvIHdlIHNraXAgcHJldmlvdXMgc3RhdGVzKVxyXG4gICAgICAgIGxldCBzdGF0ZSA9IE1hdGgubWF4KHRoaXMuZ2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQpLCB0cmlnZ2VyLnN0YXRlIHx8IDApO1xyXG5cclxuICAgICAgICAvLyByZWFjdCBvbmx5IGlmIHRyaWdnZXIgaGFzIHF1ZXN0IGlkIGFuZCBsYXN0IGFjdGl2ZSBpcyBvbGRlciB0aGFuIDEwIHNlY29uZHMgXHJcbiAgICAgICAgaWYgKHRoaXMuY2FuQWN0aXZhdGVUcmlnZ2VyKHRyaWdnZXIpKSB7XHJcbiAgICAgICAgICAgIHRyaWdnZXIubGFzdEFjdGl2ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHF1ZXN0OiBRdWVzdCA9IHRoaXMuZmluZFF1ZXN0KHRyaWdnZXIucXVlc3RJZCk7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRyaWdnZXIucXVlc3RJZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvLyAgIGludHJvXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBRdWVzdFN0YXRlLk5vbmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQsIFF1ZXN0U3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lU2NlbmUuSXNIZXJvSW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaHVkLnNldFF1ZXN0TWVzc2FnZShxdWVzdC53ZWxjb21lTXNnLCAyMDAwLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmh1ZC5zZXRRdWVzdE1lc3NhZ2UocXVlc3QuY29tcGxldGVkTXNnLCAyMDAwLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lU2NlbmUuSXNIZXJvSW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQsIFF1ZXN0U3RhdGUuRmluaXNoZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2l2ZVJld2FyZHMocXVlc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFF1ZXN0U3RhdGUodHJpZ2dlci5xdWVzdElkICsgMSwgUXVlc3RTdGF0ZS5JblByb2dyZXNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdCA9IHRoaXMuZmluZFF1ZXN0KHRyaWdnZXIucXVlc3RJZCArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaHVkLnNldFF1ZXN0TWVzc2FnZShxdWVzdC53ZWxjb21lTXNnLCA0MDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvLyAgaW50cm8gLSBqdW1wIG9uIGJveCB0YXNrXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UXVlc3RTdGF0ZSgxKSA+IFF1ZXN0U3RhdGUuRmluaXNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBRdWVzdFN0YXRlLkluUHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQsIFF1ZXN0U3RhdGUuQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5nYW1lU2NlbmUuSXNIZXJvSW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaHVkLnNldFF1ZXN0TWVzc2FnZShxdWVzdC5jb21wbGV0ZWRNc2csIDQwMDAsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTY2VuZS5Jc0hlcm9JbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRRdWVzdFN0YXRlKHRyaWdnZXIucXVlc3RJZCwgUXVlc3RTdGF0ZS5GaW5pc2hlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5naXZlUmV3YXJkcyhxdWVzdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBzdGFydCBxdWVzdCAzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3QgPSB0aGlzLmZpbmRRdWVzdCh0cmlnZ2VyLnF1ZXN0SWQgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFF1ZXN0U3RhdGUodHJpZ2dlci5xdWVzdElkICsgMSwgUXVlc3RTdGF0ZS5JblByb2dyZXNzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmh1ZC5zZXRRdWVzdE1lc3NhZ2UocXVlc3Qud2VsY29tZU1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA+PSBRdWVzdFN0YXRlLkZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdCA9IHRoaXMuZmluZFF1ZXN0KHRyaWdnZXIucXVlc3RJZCArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5odWQuc2V0UXVlc3RNZXNzYWdlKHF1ZXN0LndlbGNvbWVNc2csIDQwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzogLy8gIGludHJvIC0gZXhpdCBzaWduICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gUXVlc3RTdGF0ZS5JblByb2dyZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQsIFF1ZXN0U3RhdGUuRmluaXNoZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdpdmVSZXdhcmRzKHF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lU2NlbmUuSXNIZXJvSW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5odWQuc2V0UXVlc3RNZXNzYWdlKHF1ZXN0LmNvbXBsZXRlZE1zZywgNDAwMCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR2xvYmFsLmdldFNjbSgpLkFjdGl2YXRlU2NlbmUoXCJMb2FkZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0cy5zYXZlVXNlclN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbmQud2luKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMjAxOiAgIC8vICBLZW5kbyBrbm93bGVkZ2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyaWNRdWVzdEhhbmRsZXIocXVlc3QsIHN0YXRlLCBib2R5LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gR2xvYmFsLndvcmxkQ29udGFpbmVyLmdldENoaWxkQnlOYW1lKFwicXVlc3RfaXRlbV8yMDFcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2s6IGFueSA9IHRoaXMuZmluZEJvZHlCeU5hbWUoXCJsb2NrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lU2NlbmUucmVtb3ZlRW50aXR5KGxvY2ssIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZSh0cmlnZ2VyLnF1ZXN0SWQsIFF1ZXN0U3RhdGUuRmluaXNoZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5naXZlUmV3YXJkcyhxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWVTY2VuZS5Jc0hlcm9JbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLnNhdmVVc2VyU3RhdGUodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc25kLndpbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5odWQudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNzID0gc2NtLkdldFNjZW5lKFwiQ3V0U2NlbmVcIikgYXMgQ3V0U2NlbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcy5TZXRUZXh0KHF1ZXN0LmZpbmlzaGVkTXNnLCBRVUVTVF9TVFlMRSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnQgPSBzY20uQ2FwdHVyZVNjZW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcy5TZXRCYWNrR3JvdW5kKHJ0LCB0aGlzLmdhbWVTY2VuZS5zY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY20uQWN0aXZhdGVTY2VuZShjcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXNlIDIwMjogICAvLyAgc2VlayB0aGUgaGFuc2hpIEtlbmRvIG1hc3RlclxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuZ2VuZXJpY1F1ZXN0SGFuZGxlcihxdWVzdCwgc3RhdGUsIGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMjAzOiAgIC8vICBoYW5zaGkgS2VuZG8gbWFzdGVyIGRvam86IGNvbGxlY3QgMTAga2lcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyaWNRdWVzdEhhbmRsZXIocXVlc3QsIHN0YXRlLCBib2R5LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHsgc3RhdHMuSGFzSnVtcEF0YWNrID0gdHJ1ZTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4geyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhc2UgMjA0OiAgIC8vICBoYW5zaGkgS2VuZG8gbWFzdGVyIGRvam86IGNvbGxlY3QgMjUga2lcclxuICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmdlbmVyaWNRdWVzdEhhbmRsZXIocXVlc3QsIHN0YXRlLCBib2R5KTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJpY1F1ZXN0SGFuZGxlcihxdWVzdCwgc3RhdGUsIGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gcXVlc3QgXHJcbiAgICAgKiBAcGFyYW0gc3RhdGUgXHJcbiAgICAgKiBAcGFyYW0gYm9keSB0aGUgcGh5c2ljcyBzZW5zb3Igb3IgdHJpZ2dlciB0aGF0IGNhdXNlcyB0aGlzIHF1ZXN0XHJcbiAgICAgKiBAcGFyYW0gYWN0aW9ucyBhcnJheSBvZiBhY3Rpb25zIChvbmUgb3B0aW9uYWwgYWN0aW9uIGZvciBlYWNoIHN0YXRlKVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdlbmVyaWNRdWVzdEhhbmRsZXIocXVlc3Q6IFF1ZXN0LCBzdGF0ZTogUXVlc3RTdGF0ZSwgYm9keSwgYWN0aW9ucz86IEFycmF5PCgpID0+IHZvaWQ+KSB7XHJcbiAgICAgICAgbGV0IHRyaWdnZXI6IElUcmlnZ2VyRGVmaW5pdGlvbiA9IGJvZHkuVHJpZ2dlcjtcclxuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgUXVlc3RTdGF0ZS5Ob25lOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRRdWVzdFN0YXRlKHF1ZXN0LmlkLCBRdWVzdFN0YXRlLkluUHJvZ3Jlc3MpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5odWQuc2V0UXVlc3RNZXNzYWdlKHF1ZXN0LndlbGNvbWVNc2cpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgUXVlc3RTdGF0ZS5JblByb2dyZXNzOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5odWQuc2V0UXVlc3RNZXNzYWdlKHF1ZXN0Lm9iamVjdGl2ZU1zZyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBRdWVzdFN0YXRlLkNvbXBsZXRlZDpcclxuICAgICAgICAgICAgICAgIGlmIChxdWVzdC5pdGVtSWQgJiYgcXVlc3QuaXRlbXNDb2xsZWN0ZWQgPj0gcXVlc3QuaXRlbXNOZWVkZWQpIHsgLy8gIGlmIHRoZSBhY3F1aXJlSXRlbSBoYXMgc2V0IHF1ZXN0IHRvIGNvbXBsZXRlZCBtb3ZlIHRvIG5leHQgc3RhdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRRdWVzdFN0YXRlKHF1ZXN0LmlkLCBRdWVzdFN0YXRlLkZpbmlzaGVkKTtcclxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyLmxhc3RBY3RpdmUgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmh1ZC5zZXRRdWVzdE1lc3NhZ2UocXVlc3QuY29tcGxldGVkTXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFF1ZXN0U3RhdGUuRmluaXNoZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmh1ZC5zZXRRdWVzdE1lc3NhZ2UocXVlc3QuZmluaXNoZWRNc2cpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5naXZlUmV3YXJkcyhxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVTY2VuZS5yZW1vdmVFbnRpdHkoYm9keSwgdHJ1ZSk7IC8vIHJlbW92ZSB0aGUgc2Vuc29yIGZyb20gcGh5c2ljcyBhbmQgdGhlIGRpc3BsYXlvYmplY3QgZnJvbSBzY2VuZVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhY3Rpb25zICYmIGFjdGlvbnNbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnNbc3RhdGVdKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2l2ZVJld2FyZHMocXVlc3Q6IFF1ZXN0KSB7XHJcbiAgICAgICAgc25kLnF1ZXN0SXRlbSgpO1xyXG4gICAgICAgIGlmIChxdWVzdC5yZXdhcmRFeHApIHtcclxuICAgICAgICAgICAgc3RhdHMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLlRvdGFsRXhwLCBxdWVzdC5yZXdhcmRFeHApO1xyXG4gICAgICAgICAgICAvLyBsZXQgcHQgPSBuZXcgUElYSS5Qb2ludChHbG9iYWwucG9zaXRpb24ueCwgR2xvYmFsLnBvc2l0aW9uLnkgKyA1MCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuaHVkLmFkZEluZm9NZXNzYWdlKHB0LCBgKyR7cXVlc3QucmV3YXJkRXhwfSBleHBgLCBNU0dfRVhQX1NUWUxFKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHF1ZXN0LnJld2FyZENvaW5zKSB7XHJcbiAgICAgICAgICAgIHN0YXRzLmluY3JlYXNlU3RhdChTdGF0VHlwZS5Db2lucywgcXVlc3QucmV3YXJkQ29pbnMpO1xyXG4gICAgICAgICAgICAvLyBsZXQgcHQgPSBuZXcgUElYSS5Qb2ludChHbG9iYWwucG9zaXRpb24ueCArIDUwLCBHbG9iYWwucG9zaXRpb24ueSArIDEwMCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuaHVkLmFkZEluZm9NZXNzYWdlKHB0LCBgKyR7cXVlc3QucmV3YXJkQ29pbnN9IGNvaW5zYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0UXVlc3RTdGF0ZShxdWVzdC5pZCwgUXVlc3RTdGF0ZS5SZXdhcmRlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5kUXVlc3QocXVlc3RJZDogbnVtYmVyKTogUXVlc3Qge1xyXG4gICAgICAgIHZhciBxdWVzdHMgPSBHbG9iYWwuTGV2ZWxEZWZpbml0aW9ucy5xdWVzdHMuZmlsdGVyKChxKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBxLmlkID09PSBxdWVzdElkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBxdWVzdDogUXVlc3QgPSBxdWVzdHNbMF07XHJcbiAgICAgICAgcmV0dXJuIHF1ZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZFF1ZXN0V2l0aEl0ZW0oaXRlbUlkOiBudW1iZXIpOiBRdWVzdCB7XHJcbiAgICAgICAgdmFyIHF1ZXN0cyA9IEdsb2JhbC5MZXZlbERlZmluaXRpb25zLnF1ZXN0cy5maWx0ZXIoKHE6IFF1ZXN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChxLml0ZW1JZCA9PT0gaXRlbUlkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLmdldFF1ZXN0U3RhdGUocS5pZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUgPCBRdWVzdFN0YXRlLkNvbXBsZXRlZCAmJiBzdGF0ZSA+IFF1ZXN0U3RhdGUuTm9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHF1ZXN0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWVzdHNbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBTZXRzIHRoZSBxdWVzdCBzdGF0ZS5cclxuICAgICovXHJcbiAgICBwcml2YXRlIHNldFF1ZXN0U3RhdGUocXVlc3RJZDogbnVtYmVyLCBzdGF0ZTogUXVlc3RTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMucXVlc3RTdGF0ZVtxdWVzdElkXSA9IHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgcXVlc3Qgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0UXVlc3RTdGF0ZShxdWVzdElkOiBudW1iZXIpOiBRdWVzdFN0YXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVzdFN0YXRlW3F1ZXN0SWRdIHx8IFF1ZXN0U3RhdGUuTm9uZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmRzIGEgYm9keSB3aXRoIHRoZSBnaXZlbiBkaXNwbGF5IG9iamVjdHMgbmFtZS5cclxuICAgICAqIEBwYXJhbSBuYW1lXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZmluZEJvZHlCeU5hbWUobmFtZTogc3RyaW5nKTogcDIuQm9keSB7XHJcbiAgICAgICAgdmFyIGZvdW5kQm9keSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB3cDIuYm9kaWVzLmZvckVhY2goKGJvZHk6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgZGlzcE9iaiA9IGJvZHkuRGlzcGxheU9iamVjdCBhcyBQSVhJLkRpc3BsYXlPYmplY3Q7XHJcbiAgICAgICAgICAgIGlmIChkaXNwT2JqICYmIGRpc3BPYmoubmFtZSA9PT0gbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmRCb2R5ID0gYm9keTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3VuZEJvZHk7XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsIlxyXG5leHBvcnQgZW51bSBRdWVzdFN0YXRlIHtcclxuICAgIE5vbmUsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgUXVlc3QgaGFzIGJlZW4gc3RhcnRlZC5cclxuICAgICAqL1xyXG4gICAgSW5Qcm9ncmVzcyxcclxuXHJcbiAgICAvKipcclxuICAgICAqICBRdWVzdCBpdGVtcy9jb25kaXRpb25zIGhhdmUgYmVlbiBjb21wbGV0ZWQuXHJcbiAgICAgKi9cclxuICAgIENvbXBsZXRlZCxcclxuXHJcbiAgICAvKipcclxuICAgICAqICBRdWVzdCBoYXMgYmVlbiBmaW5pc2hlZC5cclxuICAgICAqL1xyXG4gICAgRmluaXNoZWQsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgUXVlc3QgaGFzIGJlZW4gZmluaXNoZWQgYW5kIHJld2FyZCBhd2FyZGVkLlxyXG4gICAgICovXHJcbiAgICBSZXdhcmRlZCxcclxufSIsImltcG9ydCB7IFBJWEksIFNjZW5lLCBHbG9iYWx9IGZyb20gXCIuLlwiO1xyXG5pbXBvcnQgeyBTY2VuZU1hbmFnZXIgfSBmcm9tIFwiLi5cIjtcclxuaW1wb3J0IHsgTG9hZGVyU2NlbmUgfSBmcm9tIFwiLi9Mb2FkZXJTY2VuZVwiO1xyXG5pbXBvcnQgeyBTQ0VORV9IQUxGX1dJRFRILCBTQ0VORV9IQUxGX0hFSUdIVCB9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgUXVlc3QgfSBmcm9tICcuLi9RdWVzdFN5c3RlbS9RdWVzdCc7XHJcblxyXG5jb25zdCBQUkVMT0FEX0JPT1RfQVNTRVRTID0gW1xyXG4gICAgLy8gIGN1cnNvcnNcclxuICAgICdhc3NldHMvZ3VpL2N1cl9kZWZhdWx0LnBuZycsXHJcbiAgICAnYXNzZXRzL2d1aS9jdXJfaG92ZXIucG5nJyxcclxuICAgICdhc3NldHMvZ3VpL2N1cl90YXJnZXQucG5nJyxcclxuICAgICdhc3NldHMvbGV2ZWxzLmpzb24nLFxyXG4gICAgJ2Fzc2V0cy9xdWVzdHMuanNvbidcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBQcmVsb2FkcyBjb21tb24gYXNzZXRzLCBhZnRlciBwcmVsb2FkaW5nIHBhcnNlcyB1c2VyIHN0YXRlIGFuZCBzdGFydHMgcHJlbG9hZGluZyBsZXZlbCBhc3NldHMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQm9vdFNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gICAgcHJpdmF0ZSBsb2FkaW5nTWVzc2FnZSE6IFBJWEkuVGV4dDtcclxuICAgIHByaXZhdGUgc3Bpbm5lciE6IFBJWEkuU3ByaXRlO1xyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHNjbTpTY2VuZU1hbmFnZXIpIHtcclxuICAgICAgICBzdXBlcihzY20sIFwiQm9vdFwiKTtcclxuICAgICAgICB0aGlzLkJhY2tHcm91bmRDb2xvciA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlID0gKGR0OiBudW1iZXIpPT57XHJcbiAgICAgICAgaWYgKHRoaXMuc3Bpbm5lcikge1xyXG4gICAgICAgICAgICB0aGlzLnNwaW5uZXIucm90YXRpb24gKz0gMC4wNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQWN0aXZhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nTWVzc2FnZSA9IG5ldyBQSVhJLlRleHQoXCJib290aW5nIC4uLlwiLCB7XHJcbiAgICAgICAgICAgICBmb250U2l6ZTogXCIzNnB4XCIsIFxyXG4gICAgICAgICAgICAgZm9udEZhbWlseTogXCJQZXJtYW5lbnQgTWFya2VyXCIsIFxyXG4gICAgICAgICAgICAgZmlsbDogMHgwZmYwMCwgXHJcbiAgICAgICAgICAgICBkcm9wU2hhZG93OiB0cnVlLCBcclxuICAgICAgICAgICAgIHN0cm9rZTogMHg0NGZmNDQsIFxyXG4gICAgICAgICAgICAgc3Ryb2tlVGhpY2tuZXNzOiAxIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubG9hZGluZ01lc3NhZ2UuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nTWVzc2FnZS5wb3NpdGlvbi5zZXQoU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQgLSA4MCk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmxvYWRpbmdNZXNzYWdlKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgZ2V0IGxvYWRpbmcgaW1hZ2UgYW5kIGRlZmluZSBjYWxsYmFjayBvbiBpbWFnZSBsb2FkXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBQSVhJLmxvYWRlci5yZXNldCgpXHJcbiAgICAgICAgLmFkZChcImFzc2V0cy9sb2FkaW5nLnBuZ1wiKVxyXG4gICAgICAgIC5sb2FkKHRoaXMuc3RhcnRQcmVsb2FkaW5nKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogIERvd25sb2FkcyBjb21tb24gYXNzZXRzLCBKU09OIGZpbGVzIGV0Yy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGFydFByZWxvYWRpbmcgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gICBmaXJzdCBhZGQgYSBsb2FkaW5nIHNwaW5uZXJcclxuICAgICAgICB2YXIgbG9hZGluZ1RleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKFwiYXNzZXRzL2xvYWRpbmcucG5nXCIpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBQSVhJLlNwcml0ZShsb2FkaW5nVGV4dHVyZSk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnBvc2l0aW9uLnNldChTQ0VORV9IQUxGX1dJRFRILCBTQ0VORV9IQUxGX0hFSUdIVCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zY2FsZS5zZXQoMC41KTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuc3Bpbm5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2luaXRpYWxpemluZyBjb21tb24gYXNzZXRzIHByZWxvYWRpbmcgLi4uJywgUFJFTE9BRF9CT09UX0FTU0VUUyk7XHJcbiAgICAgICAgUElYSS5sb2FkZXJcclxuICAgICAgICAgICAgLmFkZChQUkVMT0FEX0JPT1RfQVNTRVRTKVxyXG4gICAgICAgICAgICAubG9hZCh0aGlzLm9uUHJlbG9hZEZpbmlzaGVkKTsgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvblByZWxvYWRGaW5pc2hlZCA9IGFzeW5jICgpPT57XHJcbiAgICAgICAgLy8gIHByZWxvYWQgb2YgY29tbW9uIGNvbnRlbnQgaXMgZmluaXNoZWRcclxuICAgICAgICBcclxuICAgICAgICAvLyAgc2V0dXAgY3VzdG9tIGN1cnNvcnNcclxuICAgICAgICB2YXIgZGVmYXVsdEljb24gPSBcInVybCgnYXNzZXRzL2d1aS9jdXJfZGVmYXVsdC5wbmcnKSxhdXRvXCI7XHJcbiAgICAgICAgdmFyIGhvdmVySWNvbiA9IFwidXJsKCdhc3NldHMvZ3VpL2N1cl9ob3Zlci5wbmcnKSxhdXRvXCI7XHJcbiAgICAgICAgdmFyIHRhcmdldEljb24gPSBcInVybCgnYXNzZXRzL2d1aS9jdXJfdGFyZ2V0LnBuZycpIDI0IDI0LCBhdXRvXCI7XHJcbiAgICAgICAgdGhpcy5zY2VuZU1hbmFnZXIuUmVuZGVyZXIucGx1Z2lucy5pbnRlcmFjdGlvbi5jdXJzb3JTdHlsZXMuZGVmYXVsdCA9IGRlZmF1bHRJY29uO1xyXG4gICAgICAgIHRoaXMuc2NlbmVNYW5hZ2VyLlJlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24uY3Vyc29yU3R5bGVzLmhvdmVyID0gaG92ZXJJY29uO1xyXG4gICAgICAgIHRoaXMuc2NlbmVNYW5hZ2VyLlJlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24uY3Vyc29yU3R5bGVzLnRhcmdldCA9IHRhcmdldEljb247XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBkZWZhdWx0SWNvbjtcclxuXHJcbiAgICAgICAgLy8gc2F2ZSBsZXZlbHMgYW5kIHF1ZXN0c1xyXG4gICAgICAgIEdsb2JhbC5MZXZlbERlZmluaXRpb25zID0gUElYSS5sb2FkZXIucmVzb3VyY2VzW1wiYXNzZXRzL2xldmVscy5qc29uXCJdLmRhdGE7XHJcbiAgICAgICAgdmFyIHF1ZXN0c09iaiA9IFBJWEkubG9hZGVyLnJlc291cmNlc1tcImFzc2V0cy9xdWVzdHMuanNvblwiXS5kYXRhO1xyXG4gICAgICAgIEdsb2JhbC5MZXZlbERlZmluaXRpb25zLnF1ZXN0cyA9IHF1ZXN0c09iai5xdWVzdHMgYXMgQXJyYXk8UXVlc3Q+O1xyXG4gICAgICAgIEdsb2JhbC5MZXZlbERlZmluaXRpb25zLnF1ZXN0cy5mb3JFYWNoKChxOiBRdWVzdCkgPT4ge1xyXG4gICAgICAgICAgICBxLml0ZW1JZCA9IHEuaXRlbUlkIHx8IDA7XHJcbiAgICAgICAgICAgIHEuaXRlbXNOZWVkZWQgPSBxLml0ZW1zTmVlZGVkIHx8IDA7XHJcbiAgICAgICAgICAgIHEuaXRlbXNDb2xsZWN0ZWQgPSAwO1xyXG4gICAgICAgICAgICBxLnJld2FyZENvaW5zID0gcS5yZXdhcmRDb2lucyB8fCAwO1xyXG4gICAgICAgICAgICBxLnJld2FyZEV4cCA9IHEucmV3YXJkRXhwIHx8IDA7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxzID0gbmV3IExvYWRlclNjZW5lKHRoaXMuc2NlbmVNYW5hZ2VyKTtcclxuICAgICAgICB0aGlzLnNjZW5lTWFuYWdlci5BZGRTY2VuZShscyk7XHJcbiAgICAgICAgdGhpcy5zY2VuZU1hbmFnZXIuQWN0aXZhdGVTY2VuZShscyk7IFxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi4vX2VuZ2luZS9TY2VuZVwiO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiLi4vX2VuZ2luZS9CdXR0b25cIjtcclxuaW1wb3J0IHsgc25kIH0gZnJvbSBcIi4uL3dvcmxkL1NvdW5kTWFuXCI7XHJcbmltcG9ydCB7IFNjZW5lTWFuYWdlciwgU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQsIFNDRU5FX0hFSUdIVCwgQlROX1dJRFRILCBTQ0VORV9XSURUSCwgQlROX0hFSUdIVCwgQlROX1NUWUxFLCBUZXh0dXJlTG9hZGVyIH0gZnJvbSAnLi4nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEN1dFNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gICAgcHJpdmF0ZSBjYWxsb3V0OiBQSVhJLlNwcml0ZTtcclxuICAgIHByaXZhdGUgdGV4dE1lc3NhZ2U6IFBJWEkuVGV4dDtcclxuICAgIHByaXZhdGUgYmFja1Nwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwcml2YXRlIGRlYXRoU2NlbmU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgY29ycHNlOiBQSVhJLlNwcml0ZTtcclxuICAgIHByaXZhdGUgYnRuQ29udGludWU6IEJ1dHRvbjtcclxuXHJcbiAgICBwcml2YXRlIGNvcnBzZUJsdXJGaWx0ZXI6IFBJWEkuZmlsdGVycy5CbHVyRmlsdGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjbTogU2NlbmVNYW5hZ2VyKSB7XHJcbiAgICAgICAgc3VwZXIoc2NtLCBcIkN1dFNjZW5lXCIpO1xyXG4gICAgICAgIHRoaXMuQmFja0dyb3VuZENvbG9yID0gMHgxMDk5YmI7XHJcblxyXG4gICAgICAgIHRoaXMuY29ycHNlID0gbmV3IFBJWEkuU3ByaXRlKFBJWEkubG9hZGVyLnJlc291cmNlc1tcImFzc2V0cy9oZXJvLWRlYWQucG5nXCJdLnRleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuY29ycHNlLmFuY2hvci5zZXQoMC41KTtcclxuICAgICAgICB0aGlzLmNvcnBzZS5waXZvdC5zZXQoMC41KTtcclxuICAgICAgICB0aGlzLmNvcnBzZS5wb3NpdGlvbi5zZXQoU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQpO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jb3Jwc2UpO1xyXG5cclxuICAgICAgICB0aGlzLmNvcnBzZUJsdXJGaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkJsdXJGaWx0ZXIoKTtcclxuICAgICAgICB0aGlzLmNvcnBzZS5maWx0ZXJzID0gW3RoaXMuY29ycHNlQmx1ckZpbHRlcl07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNhbGxvdXQgPSBuZXcgUElYSS5TcHJpdGUoVGV4dHVyZUxvYWRlci5HZXQoXCJhc3NldHMvZ3VpLWF0bGFzLmpzb25AcmVjdC5wbmdcIikpO1xyXG4gICAgICAgIHRoaXMuY2FsbG91dC5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgdGhpcy5jYWxsb3V0LnBvc2l0aW9uLnNldChTQ0VORV9IQUxGX1dJRFRILCBTQ0VORV9IRUlHSFQgLyA1KTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuY2FsbG91dCk7XHJcblxyXG4gICAgICAgIHRoaXMudGV4dE1lc3NhZ2UgPSBuZXcgUElYSS5UZXh0KFwiXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dE1lc3NhZ2UuYW5jaG9yLnNldCgwLjUpO1xyXG4gICAgICAgIHRoaXMudGV4dE1lc3NhZ2UucG9zaXRpb24uc2V0KDAsIDApO1xyXG4gICAgICAgIHRoaXMuY2FsbG91dC5hZGRDaGlsZCh0aGlzLnRleHRNZXNzYWdlKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBidG4gZm9yIG5leHQgbGV2ZWxcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgdGhpcy5idG5Db250aW51ZSA9IG5ldyBCdXR0b24oICBcImFzc2V0cy9ndWktYXRsYXMuanNvbkBndWlfYnV0dG9uMS5wbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChTQ0VORV9XSURUSCAtIEJUTl9XSURUSCkgLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsb3V0LmhlaWdodCArIEJUTl9IRUlHSFQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCVE5fV0lEVEgsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQlROX0hFSUdIVCk7XHJcbiAgICAgICAgdGhpcy5idG5Db250aW51ZS50ZXh0ID0gbmV3IFBJWEkuVGV4dChcIkNvbnRpbnVlXCIsIEJUTl9TVFlMRSk7XHJcbiAgICAgICAgdGhpcy5idG5Db250aW51ZS5vbkNsaWNrID0gKCkgPT4geyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNjZW5lTWFuYWdlci5BY3RpdmF0ZVNjZW5lKFwiTG9hZGVyXCIpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmJ0bkNvbnRpbnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BY3RpdmF0ZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmJ0bkNvbnRpbnVlLnZpc2libGUgPSAhdGhpcy5kZWF0aFNjZW5lO1xyXG4gICAgICAgIHRoaXMuY2FsbG91dC52aXNpYmxlID0gIXRoaXMuZGVhdGhTY2VuZTtcclxuICAgICAgICB0aGlzLmNvcnBzZS52aXNpYmxlID0gdGhpcy5kZWF0aFNjZW5lO1xyXG4gICAgICAgIHRoaXMuY29ycHNlLnNjYWxlLnNldCgwLjEpO1xyXG4gICAgICAgIHRoaXMuYnRuQ29udGludWUudGV4dC50ZXh0ID0gdGhpcy5kZWF0aFNjZW5lID8gXCJSZXRyeVwiIDogXCJDb250aW51ZVwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWF0aFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWF0aFRyYWNrSWQgPSBzbmQuZ2V0VHJhY2soXCJDYXJyb3VzZWxcIik7XHJcbiAgICAgICAgICAgIHNuZC5wbGF5VHJhY2soZGVhdGhUcmFja0lkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlKGR0OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5kZWF0aFNjZW5lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvcnBzZS5zY2FsZS54IDwgMi41KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvcnBzZS5yb3RhdGlvbiArPSAwLjAzO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjYWxlID0gdGhpcy5jb3Jwc2Uuc2NhbGUueCArIDAuMDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvcnBzZS5zY2FsZS5zZXQoc2NhbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gIGRlYXRoIG1zZyAmIHJldHJ5IGJ0blxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWF0aFNjZW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRNZXNzYWdlLnRleHQgPSB0aGlzLmRlYXRoTWVzc2FnZXNbMCB8IChNYXRoLnJhbmRvbSgpICogdGhpcy5kZWF0aE1lc3NhZ2VzLmxlbmd0aCldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsb3V0LnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idG5Db250aW51ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29ycHNlLnJvdGF0aW9uICs9IDAuMDA1OyAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYmxyID0gTWF0aC5tYXgoNSwgdGhpcy5jb3Jwc2VCbHVyRmlsdGVyLmJsdXIgKyAwLjAwMDA0KTtcclxuICAgICAgICB0aGlzLmNvcnBzZUJsdXJGaWx0ZXIuYmx1ciA9IGJscjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRydWUgdGhlIHBsYXllciBkZWF0aCBzY2VuZSBpcyBwbGF5ZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgRGVhdGhTY2VuZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWF0aFNjZW5lO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBEZWF0aFNjZW5lKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5kZWF0aFNjZW5lID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVhdGhTY2VuZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvcnBzZUJsdXJGaWx0ZXIuYmx1ciA9IDA7XHJcbiAgICAgICAgICAgIHZhciBjbG0gPSBuZXcgUElYSS5maWx0ZXJzLkNvbG9yTWF0cml4RmlsdGVyKCk7XHJcbiAgICAgICAgICAgIGNsbS5zZXBpYSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tTcHJpdGUuZmlsdGVycyA9IFtjbG1dO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja1Nwcml0ZS5maWx0ZXJzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBTZXRCYWNrR3JvdW5kKHRleHR1cmU6IFBJWEkuUmVuZGVyVGV4dHVyZSwgc2NhbGUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYmFja1Nwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tTcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGRBdCh0aGlzLmJhY2tTcHJpdGUsIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja1Nwcml0ZS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iYWNrU3ByaXRlLnNjYWxlLnNldCgxIC8gc2NhbGUueCwgMSAvIHNjYWxlLnkpOyAgLy8gIHJlc2NhbGUgdG8gZml0IGZ1bGwgc2NlbmVcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgU2V0VGV4dCh0ZXh0OiBzdHJpbmcsIHN0eWxlPzogUElYSS5UZXh0U3R5bGVPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0TWVzc2FnZS50ZXh0ID0gdGV4dDtcclxuICAgICAgICBpZiAoc3R5bGUpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0TWVzc2FnZS5zdHlsZSA9IG5ldyBQSVhJLlRleHRTdHlsZShzdHlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGVhdGhNZXNzYWdlczogc3RyaW5nW10gPSBbXHJcbiAgICAgICAgXCJMaWZlIHN1Y2tzIGFuZCB5b3UganVzdCBkaWVkIVwiLFxyXG4gICAgICAgIFwiWW91IGRlY2lkZWQgdG8gY2hlY2sgdGhlXFxuYWZ0ZXJsaWZlLiBHdWVzcyB3aGF0P1xcblxcbllvdSBhcmUgZGVhZCFcIixcclxuICAgICAgICBcIk93bmVkIVxcbk1vcmUgbHVjayBuZXh0IHRpbWUuXCIsXHJcbiAgICAgICAgXCJZb3UgaGF2ZSBkaWVkIVxcblJlc3QgaW4gcGVhY2UuXCIsXHJcbiAgICAgICAgXCJZb3VyIHF1ZXN0IGhhcyBmYWlsZWQuXFxuTWF5IHlvdSBmaW5kIG1vcmUgcGVhY2VcXG5pbiB0aGF0IHdvcmxkIHRoYW5cXG55b3UgZm91bmQgaW4gdGhpcyBvbmUuXCIsXHJcbiAgICAgICAgXCJIZXJlJ3MgYSBwaWN0dXJlIG9mXFxueW91ciBjb3Jwc2UuXFxuXFxuTm90IHByZXR0eSFcIixcclxuICAgICAgICBcIlllcCwgeW91J3JlIGRlYWQuXFxuTWF5YmUgeW91IHNob3VsZCBjb25zaWRlclxcbnBsYXlpbmcgYSBCYXJiaWUgZ2FtZSFcIixcclxuICAgICAgICBcIkRpZWQuLi5cIlxyXG4gICAgXTtcclxufSIsImltcG9ydCB7IEdsb2JhbCwgUElYSSwgU2NlbmUsIFNjZW5lTWFuYWdlciB9IGZyb20gXCIuLlwiO1xyXG5pbXBvcnQgeyBHZXRMZXZlbEFzc2V0cyB9IGZyb20gJy4uL3dvcmxkL0xldmVsSGVscGVyJztcclxuaW1wb3J0IHsgc3RhdHMgfSBmcm9tICcuLi9vYmplY3RzL1BsYXllclN0YXRzJztcclxuaW1wb3J0IHsgU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBNYXN0ZXJIdWQgfSBmcm9tICcuLi9vYmplY3RzL01hc3Rlckh1ZCc7XHJcbmltcG9ydCB7IE1haW5TY2VuZSB9IGZyb20gJy4vTWFpblNjZW5lJztcclxuaW1wb3J0IHsgT3B0aW9uc1NjZW5lIH0gZnJvbSAnLi9PcHRpb25zU2NlbmUnO1xyXG5pbXBvcnQgeyBDdXRTY2VuZSB9IGZyb20gJy4vQ3V0U2NlbmUnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBMb2FkZXJTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICAgIHByaXZhdGUgbG9hZGluZ01lc3NhZ2U6IFBJWEkuVGV4dDtcclxuICAgIHByaXZhdGUgc3Bpbm5lcjogUElYSS5TcHJpdGU7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBwcmVsb2FkQXNzZXRzIDogc3RyaW5nW10gPSBbICBcclxuICAgICAgICAvLyAgZ3VpIHN0dWZmXHJcbiAgICAgICAgJ2Fzc2V0cy9ndWktYXRsYXMuanNvbicsXHJcbiAgICAgICAgLy8gJ2Fzc2V0cy9ndWkvZ3VpX2ZzX2VudGVyLnBuZycsXHJcbiAgICAgICAgLy8gJ2Fzc2V0cy9ndWkvZ3VpX2ZzX2V4aXQucG5nJyxcclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9ndWlfb3B0aW9ucy5wbmcnLFxyXG4gICAgICAgIC8vICdhc3NldHMvZ3VpL2d1aV9iYWNrLnBuZycsXHJcbiAgICAgICAgLy8gJ2Fzc2V0cy9ndWkvZ3VpX2J1dHRvbjEucG5nJyxcclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9ndWlfc2xpZGVyMS5wbmcnLCBcclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9ndWlfbWludXMucG5nJywgIFxyXG5cclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9oZWFydC5wbmcnLFxyXG4gICAgICAgIC8vICdhc3NldHMvZ3VpL2NvaW4ucG5nJyxcclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9yZWN0LnBuZycsXHJcbiAgICAgICAgLy8gJ2Fzc2V0cy9ndWkvc3RhdF9wYW5lbC5wbmcnLFxyXG4gICAgICAgIC8vICdhc3NldHMvZ3VpL2V4cF9wYW5lbC5wbmcnLFxyXG4gICAgICAgIC8vICdhc3NldHMvZ3VpL2V4cF9wcmVmaWxsLnBuZycsXHJcbiAgICAgICAgLy8gJ2Fzc2V0cy9ndWkvZXhwX2ZpbGwucG5nJyxcclxuICAgICAgICAvLyAnYXNzZXRzL2d1aS9wYW5lbC5wbmcnLFxyXG5cclxuICAgICAgICAvL1xyXG4gICAgICAgICdhc3NldHMvaGVyby5wbmcnLFxyXG4gICAgICAgICdhc3NldHMvaGVyby1kZWFkLnBuZycsXHJcbiAgICAgICAgJ2Fzc2V0cy9zdGFyLnBuZycsXHJcbiAgICAgICAgJ2Fzc2V0cy9pbWcvZWZmZWN0cy9mbGFtZS5wbmcnLFxyXG4gICAgICAgICdhc3NldHMvaW1nL2VmZmVjdHMvanVtcF9zbW9rZS5wbmcnLFxyXG4gICAgICAgICdhc3NldHMvaW1nL2VmZmVjdHMvbG9hZC5wbmcnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjbTpTY2VuZU1hbmFnZXIpIHtcclxuICAgICAgICBzdXBlcihzY20sIFwiTG9hZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuQmFja0dyb3VuZENvbG9yID0gMDtcclxuICAgICAgICB0aGlzLmxvYWRpbmdNZXNzYWdlID0gbmV3IFBJWEkuVGV4dChcImxvYWRpbmcgLi4uXCIsIHsgXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAzNiwgXHJcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiUGVybWFuZW50IE1hcmtlclwiLCBcclxuICAgICAgICAgICAgZmlsbDogMHgwZmYwMCwgXHJcbiAgICAgICAgICAgIGRyb3BTaGFkb3c6IHRydWUsIFxyXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcclxuICAgICAgICAgICAgc3Ryb2tlOiAweDQ0ZmY0NCwgXHJcbiAgICAgICAgICAgIHN0cm9rZVRoaWNrbmVzczogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubG9hZGluZ01lc3NhZ2UuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5sb2FkaW5nTWVzc2FnZS5wb3NpdGlvbi5zZXQoU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQgLSA4MCk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLmxvYWRpbmdNZXNzYWdlKTtcclxuXHJcbiAgICAgICAgdmFyIGxvYWRpbmdUZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShcImFzc2V0cy9sb2FkaW5nLnBuZ1wiKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgUElYSS5TcHJpdGUobG9hZGluZ1RleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5wb3NpdGlvbi5zZXQoU0NFTkVfSEFMRl9XSURUSCwgU0NFTkVfSEFMRl9IRUlHSFQpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc2NhbGUuc2V0KDAuNSk7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnNwaW5uZXIpOyBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25VcGRhdGUgPSAoZHQ6IG51bWJlcik9PntcclxuICAgICAgICBpZiAodGhpcy5zcGlubmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lci5yb3RhdGlvbiArPSAwLjA1O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BY3RpdmF0ZSA9ICgpID0+IHsgICBcclxuICAgICAgICBjb25zb2xlLmxvZyhgZG93bmxvYWRpbmcgbGV2ZWwgJHtzdGF0cy5jdXJyZW50R2FtZUxldmVsfS4uLmApO1xyXG4gICAgICAgIGxldCBhc3NldHM6IHN0cmluZ1tdID0gR2V0TGV2ZWxBc3NldHMoR2xvYmFsLkxldmVsRGVmaW5pdGlvbnMsIHN0YXRzLmN1cnJlbnRHYW1lTGV2ZWwpO1xyXG4gICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQodGhpcy5wcmVsb2FkQXNzZXRzKTtcclxuXHJcbiAgICAgICAgUElYSS5sb2FkZXJcclxuICAgICAgICAgICAgLnJlc2V0KClcclxuICAgICAgICAgICAgLmFkZChhc3NldHMpXHJcbiAgICAgICAgICAgIC5sb2FkKHRoaXMuaGFuZGxlTGV2ZWxMb2FkaW5nKVxyXG4gICAgICAgICAgICAub24oXCJwcm9ncmVzc1wiLCB0aGlzLm9uUHJvZ3Jlc3MpO1xyXG4gICAgfTtcclxuICAgXHJcbiAgICBwcml2YXRlIGhhbmRsZUxldmVsTG9hZGluZyA9ICgpPT4geyAgICAgICAgXHJcbiAgICAgICAgaWYoIXRoaXMuc2NlbmVNYW5hZ2VyLkhhc1NjZW5lKFwiTWFpblwiKSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgc2NlbmVzLi4uJyk7ICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNjZW5lTWFuYWdlci5BZGRTY2VuZShuZXcgTWFpblNjZW5lKHRoaXMuc2NlbmVNYW5hZ2VyKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmVNYW5hZ2VyLkFkZFNjZW5lKG5ldyBPcHRpb25zU2NlbmUodGhpcy5zY2VuZU1hbmFnZXIpKTtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZU1hbmFnZXIuQWRkU2NlbmUobmV3IEN1dFNjZW5lKHRoaXMuc2NlbmVNYW5hZ2VyKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmVNYW5hZ2VyLk1hc3Rlckh1ZE92ZXJsYXkgPSBuZXcgTWFzdGVySHVkKHRoaXMuc2NlbmVNYW5hZ2VyKTs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgbWFpblNjZW5lID0gdGhpcy5zY2VuZU1hbmFnZXIuR2V0U2NlbmUoXCJNYWluXCIpIGFzIE1haW5TY2VuZTtcclxuICAgICAgICAgICAgbWFpblNjZW5lLnN0YXJ0TGV2ZWwoKTsgICAgICAgICAgICBcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXhjZXB0aW9uOiBcIiwgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBvblByb2dyZXNzID0gKGxvYWRlcjogUElYSS5sb2FkZXJzLkxvYWRlciwgcmVzb3VyY2U6IFBJWEkubG9hZGVycy5SZXNvdXJjZSkgPT4ge1xyXG4gICAgICAgIHZhciBwcm9ncmVzcyA9IGxvYWRlci5wcm9ncmVzcztcclxuICAgICAgICBjb25zb2xlLmxvZyhcInByb2dyZXNzOiBcIiArIHByb2dyZXNzLnRvRml4ZWQoMCkgKyBcIiUsIGFzc2V0OiBcIiArIHJlc291cmNlLm5hbWUpO1xyXG4gICAgICAgIHRoaXMubG9hZGluZ01lc3NhZ2UudGV4dCA9IFwiTG9hZGluZyBcIiArIHByb2dyZXNzLnRvRml4ZWQoMCkgKyBcIiAlXCI7XHJcbiAgICB9O1xyXG59IiwiaW1wb3J0ICogYXMgcDIgZnJvbSAncDInO1xyXG5pbXBvcnQgKiBhcyBUV0VFTiBmcm9tIFwiQHR3ZWVuanMvdHdlZW4uanNcIjtcclxuaW1wb3J0IHsgUElYSSwgU2NlbmVNYW5hZ2VyLCBTY2VuZSwgUGFyYWxsYXgsIEdsb2JhbCB9IGZyb20gXCIuLlwiO1xyXG5pbXBvcnQgeyB3cDIgfSBmcm9tICcuLi93b3JsZC9Xb3JsZFAyJztcclxuaW1wb3J0IHsgSGVyb0NoYXJhY3RlciB9IGZyb20gJy4uL29iamVjdHMvSGVyb0NoYXJhY3Rlcic7XHJcbmltcG9ydCB7IFN0YXRzSHVkIH0gZnJvbSAnLi4vb2JqZWN0cy9TdGF0c0h1ZCc7XHJcbmltcG9ydCB7IHN0YXRzIH0gZnJvbSAnLi4vb2JqZWN0cy9QbGF5ZXJTdGF0cyc7XHJcbmltcG9ydCB7IEJ1bGxldCB9IGZyb20gJy4uL29iamVjdHMvQnVsbGV0JztcclxuaW1wb3J0IHsgQlVSTl9UT1BJQywgSUJ1cm5DaGFuZ2VFdmVudCwgR1JPVU5EX1NIQUtFLCBldmVudEVtaXR0ZXIgfSBmcm9tICcuLi9ldmVudHMnO1xyXG5pbXBvcnQgeyBTQ0VORV9IRUlHSFQsIFNDRU5FX0hBTEZfV0lEVEgsIFNDRU5FX0JBQ0tDT0xPUiwgTVNHX0NPSU5fU1RZTEUsIE1TR19XQVJOX1NUWUxFLCBBTklNQVRJT05fRlBTX1NMT1cgfSBmcm9tICcuLi9jb25zdGFudHMnO1xyXG5pbXBvcnQgeyBMYXZhIH0gZnJvbSAnLi4vb2JqZWN0cy9MYXZhJztcclxuaW1wb3J0IHsgTGV2ZWxMb2FkZXIgfSBmcm9tICcuLi93b3JsZC9MZXZlbExvYWRlcic7XHJcbmltcG9ydCB7IFBsYXRmb3JtIH0gZnJvbSAnLi4vb2JqZWN0cy9QbGF0Zm9ybSc7XHJcbmltcG9ydCB7IEJ1bXBlciB9IGZyb20gJy4uL29iamVjdHMvQnVtcGVyJztcclxuaW1wb3J0IHsgc25kIH0gZnJvbSAnLi4vd29ybGQvU291bmRNYW4nO1xyXG5pbXBvcnQgeyBDdXRTY2VuZSB9IGZyb20gJy4vQ3V0U2NlbmUnO1xyXG5pbXBvcnQgeyBRdWVzdE1hbmFnZXIgfSBmcm9tICcuLi9xdWVzdFN5c3RlbS9RdWVzdE1hbmFnZXInO1xyXG5pbXBvcnQgeyBTdGF0VHlwZSwgRGFtYWdlVHlwZSB9IGZyb20gJy4uL2VudW1zJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTWFpblNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gICAgcHJpdmF0ZSB3b3JsZENvbnRhaW5lcjogUElYSS5Db250YWluZXI7XHJcbiAgICBwcml2YXRlIGhlcm86IEhlcm9DaGFyYWN0ZXI7XHJcbiAgICBwcml2YXRlIHF1ZXN0TW5nciA6IFF1ZXN0TWFuYWdlcjtcclxuICAgIHByaXZhdGUgaHVkIDogU3RhdHNIdWQ7XHJcblxyXG5cclxuICAgIHByaXZhdGUgc2hha2VEdXJhdGlvbjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgc2hha2VFbmQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIG5leHRTaGFrZTogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgbWFnbml0dWRlOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBzaGFrZVg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgc2hha2VZOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IFNIQUtFX0NPVU5UID0gMTU7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NtOiBTY2VuZU1hbmFnZXIpIHtcclxuICAgICAgICBzdXBlcihzY20sIFwiTWFpblwiKTtcclxuICAgICAgICB0aGlzLkJhY2tHcm91bmRDb2xvciA9IFNDRU5FX0JBQ0tDT0xPUjtcclxuICAgICAgICB0aGlzLnNldHVwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVXBkYXRlKGR0OiBudW1iZXIpIHtcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgdXBkYXRlIHdvcmxkICYgd29ybGQgY29udGFpbmVyIHBvc2l0aW9uXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAgICAgICBcclxuICAgICAgICB3cDIudXBkYXRlKGR0KTtcclxuICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLnggPSAoU0NFTkVfSEFMRl9XSURUSCAtIHRoaXMuaGVyby54KTtcclxuICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLnkgPSAoU0NFTkVfSEVJR0hUIC0gNzApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICB1cGRhdGUgcGFyYWxsYXhcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBzdGF0cy5jdXJyZW50TGV2ZWwucGFyYWxsYXguZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgcC5TZXRWaWV3UG9ydFgoR2xvYmFsLnBvc2l0aW9uLngpO1xyXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSBHbG9iYWwucG9zaXRpb24ueCAtIFNDRU5FX0hBTEZfV0lEVEg7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICB1cGRhdGUgZW50aXRpZXMgcG9zaXRpb25cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB2YXIgYm9kaWVzID0gd3AyLmJvZGllcztcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYm9kaWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0gYm9kaWVzW2ldIGFzIGFueTtcclxuICAgICAgICAgICAgbGV0IGRpc3BsYXlPYmplY3Q6IFBJWEkuRGlzcGxheU9iamVjdCA9IChib2R5IGFzIGFueSkuRGlzcGxheU9iamVjdCBhcyBQSVhJLkRpc3BsYXlPYmplY3Q7XHJcbiAgICAgICAgICAgIGlmIChkaXNwbGF5T2JqZWN0ICYmIGRpc3BsYXlPYmplY3QudmlzaWJsZSAmJiBib2R5LnR5cGUgIT09IHAyLkJvZHkuU1RBVElDKSB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5T2JqZWN0LnBvc2l0aW9uLnNldChNYXRoLmZsb29yKGJvZHkuaW50ZXJwb2xhdGVkUG9zaXRpb25bMF0pLCBNYXRoLmZsb29yKGJvZHkuaW50ZXJwb2xhdGVkUG9zaXRpb25bMV0pKTtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlPYmplY3Qucm90YXRpb24gPSBib2R5LmludGVycG9sYXRlZEFuZ2xlO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoYm9keS5UcmlnZ2VyICYmIGJvZHkuVHJpZ2dlci50eXBlID09PSBcImRpc3RhbmNlXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXN0TW5nci5jYW5BY3RpdmF0ZVRyaWdnZXIoYm9keS5UcmlnZ2VyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB4ID0gdGhpcy5oZXJvLnBvc2l0aW9uLnggLSBib2R5LnBvc2l0aW9uWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB5ID0gdGhpcy5oZXJvLnBvc2l0aW9uLnkgLSBib2R5LnBvc2l0aW9uWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYm9keS5UcmlnZ2VyLmRpc3RhbmNlID49IGRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVlc3RNbmdyLmhhbmRsZVRyaWdnZXJFdmVudChib2R5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgY29sbGlzaW9ucyB3aXRoIGNvbGxlY3RpYmxlIGl0ZW1zXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHdwMi5wbGF5ZXJDb250YWN0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgYm9keTogYW55ID0gd3AyLnBsYXllckNvbnRhY3RzW2ldO1xyXG4gICAgICAgICAgICBpZiAoYm9keS5EaXNwbGF5T2JqZWN0ICYmIGJvZHkuRGlzcGxheU9iamVjdC5pbnRlcmFjdGlvblR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlSW50ZXJhY3RpdmVDb2xsaXNpb24oYm9keSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChib2R5LlRyaWdnZXIgJiYgYm9keS5UcmlnZ2VyLnR5cGUgPT09IFwiY29sbGlzaW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucXVlc3RNbmdyLmhhbmRsZVRyaWdnZXJFdmVudChib2R5KTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIGludm9rZSB1cGRhdGUgb24gZWFjaCB1cGRhdGVhYmxlXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMud29ybGRDb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkOiBhbnkgPSB0aGlzLndvcmxkQ29udGFpbmVyLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQub25VcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLm9uVXBkYXRlKGR0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBTcGF3biBwb2ludHNcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3RhdHMuY3VycmVudExldmVsLnNwYXduUG9pbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN0YXRzLmN1cnJlbnRMZXZlbC5zcGF3blBvaW50c1tpXS5vblVwZGF0ZShkdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmh1ZC5vblVwZGF0ZShkdCk7XHJcbiAgICAgICAgc3RhdHMub25VcGRhdGUoZHQpO1xyXG5cclxuICAgICAgICB2YXIgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBjaGVjayBpZiBwbGF5ZXIgaXMgZGVhZFxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIGlmIChzdGF0cy5nZXRTdGF0KFN0YXRUeXBlLkhQKSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuSXNIZXJvSW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5oZXJvLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGN1dFNjZW5lID0gdGhpcy5zY2VuZU1hbmFnZXIuR2V0U2NlbmUoXCJDdXRTY2VuZVwiKSBhcyBDdXRTY2VuZTtcclxuICAgICAgICAgICAgdmFyIGJhY2tHcm91bmRUZXh0dXJlID0gdGhpcy5zY2VuZU1hbmFnZXIuQ2FwdHVyZVNjZW5lKCk7XHJcbiAgICAgICAgICAgIGN1dFNjZW5lLlNldEJhY2tHcm91bmQoYmFja0dyb3VuZFRleHR1cmUsIHRoaXMuc2NhbGUpO1xyXG4gICAgICAgICAgICBjdXRTY2VuZS5EZWF0aFNjZW5lID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZU1hbmFnZXIuQWN0aXZhdGVTY2VuZShjdXRTY2VuZSk7XHJcbiAgICAgICAgfSAgZWxzZSBpZiAodGhpcy5zaGFrZUVuZCA+PSBub3cpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubmV4dFNoYWtlIDw9IG5vdykge1xyXG4gICAgICAgICAgICAgICAgLy8gIG9yaWdpbmFsIHN0YXJ0IHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IChTQ0VORV9IQUxGX1dJRFRIIC0gdGhpcy5oZXJvLngpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSAoU0NFTkVfSEVJR0hUIC0gNzApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2hha2VYID0geCArIHRoaXMucmFuZG9tUmFuZ2UoLXRoaXMubWFnbml0dWRlIC8gMiwgdGhpcy5tYWduaXR1ZGUgLyAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hha2VZID0geSArIHRoaXMucmFuZG9tUmFuZ2UoLXRoaXMubWFnbml0dWRlLCB0aGlzLm1hZ25pdHVkZSk7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwic2hha2U6IFwiICsgdGhpcy5zaGFrZVggKyBcIiwgXCIgKyB0aGlzLnNoYWtlWSwgdGhpcy5tYWduaXR1ZGUsIHRoaXMuc2hha2VFbmQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICByZWR1Y2UgZm9yIG5leHQgc2hha2VcclxuICAgICAgICAgICAgICAgIHRoaXMubWFnbml0dWRlIC09IHRoaXMubWFnbml0dWRlIC8gdGhpcy5TSEFLRV9DT1VOVDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dFNoYWtlID0gbm93ICsgdGhpcy5zaGFrZUR1cmF0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLnggPSB0aGlzLnNoYWtlWDtcclxuICAgICAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lci55ID0gdGhpcy5zaGFrZVk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXAoKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMud29ybGRDb250YWluZXIuc2NhbGUueSA9IC0xO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy53b3JsZENvbnRhaW5lcik7XHJcbiAgICAgICAgR2xvYmFsLndvcmxkQ29udGFpbmVyID0gdGhpcy53b3JsZENvbnRhaW5lcjtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBzZXR1cCBoZXJvIFxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gICAgIFxyXG4gICAgICAgIHRoaXMuaGVybyA9IG5ldyBIZXJvQ2hhcmFjdGVyKHRoaXMud29ybGRDb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuaGVyby5uYW1lID0gXCJoZXJvXCI7XHJcbiAgICAgICAgdGhpcy5oZXJvLnggPSBTQ0VORV9IQUxGX1dJRFRIO1xyXG4gICAgICAgIHRoaXMud29ybGRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5oZXJvKTtcclxuICAgICAgICB0aGlzLmhlcm8ucGxheShcImlkbGVcIiwgQU5JTUFUSU9OX0ZQU19TTE9XKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBzZXR1cCBodWQnc1xyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB0aGlzLmh1ZCA9IG5ldyBTdGF0c0h1ZCgpO1xyXG4gICAgICAgIHRoaXMuSHVkT3ZlcmxheSA9IHRoaXMuaHVkO1xyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIHJlZ2lzdGVyIGN1c3RvbSBlbnRpdHkgZmFjdG9yaWVzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIExldmVsTG9hZGVyLnJlZ2lzdGVyRmFjdG9yeShcIkxhdmFcIiwgKGRlZik9PiBuZXcgTGF2YShkZWYudGV4dHVyZSBhcyBzdHJpbmcpKTtcclxuICAgICAgICBMZXZlbExvYWRlci5yZWdpc3RlckZhY3RvcnkoXCJQbGF0Zm9ybVwiLCAoZGVmKT0+IHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkZWYudGV4dHVyZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbGF0Zm9ybShkZWYudGlsZXNYIHx8IDEsIDEsIFtkZWYudGV4dHVyZV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbGF0Zm9ybShkZWYudGlsZXNYIHx8IDEsIGRlZi50aWxlc1kgfHwgMSwgZGVmLnRleHR1cmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgTGV2ZWxMb2FkZXIucmVnaXN0ZXJGYWN0b3J5KFwiQnVtcGVyXCIsIChkZWYpPT4gbmV3IEJ1bXBlcigpKTtcclxuXHJcbiAgICAgICAgdGhpcy5xdWVzdE1uZ3IgPSBuZXcgUXVlc3RNYW5hZ2VyKHRoaXMpO1xyXG4gICAgICAgIGV2ZW50RW1pdHRlci5vbihCVVJOX1RPUElDLCAoZXZlbnQ6IElCdXJuQ2hhbmdlRXZlbnQpID0+IGV2ZW50LmlzQnVybmluZyA/IHNuZC5idXJuKCk6c25kLmJ1cm5TdG9wKCkgKTsgIFxyXG4gICAgICAgIGV2ZW50RW1pdHRlci5vbihHUk9VTkRfU0hBS0UsIHRoaXMuc3RhcnRHcm91bmRTaGFrZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0TGV2ZWwoKXtcclxuICAgICAgICB0aGlzLmNsZWFyTGV2ZWwoKTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICB0ZXN0IGxldmVsIGxvYWRpbmdcclxuICAgICAgICAvLyAgVE9ETzogdGhpcyBzaG91bGQgYmUgdmlhIHVzZXIgc2F2ZSBmaWxlXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHN0YXRzLmxvYWRMZXZlbCgpO1xyXG4gICAgICAgIHNuZC5wbGF5VHJhY2soc3RhdHMuY3VycmVudExldmVsLmF1ZGlvVHJhY2sgfHwgMCk7XHJcbiAgICAgICAgc3RhdHMuY3VycmVudExldmVsLnBhcmFsbGF4LmZvckVhY2goKHBseCwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGRDb250YWluZXIuYWRkQ2hpbGRBdChwbHgsIGlkeCk7XHJcbiAgICAgICAgICAgIHBseC5TZXRWaWV3UG9ydFgoc3RhdHMuY3VycmVudExldmVsLnN0YXJ0WzBdKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vICBhZGQgYWxsIG9iamVjdHMgZnJvbSBsZXZlbCB0byBzY2VuZVxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBzdGF0cy5jdXJyZW50TGV2ZWwuZW50aXRpZXMuZm9yRWFjaCgoYm9keTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGRDb250YWluZXIuYWRkQ2hpbGQoYm9keS5EaXNwbGF5T2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgIC8vICBpZiBlbnRpdHkgaXMgYSBzaW1wbGUgc3ByaXRlIGl0IGhhcyBhIFwiZmFrZVwiIGJvZHkgIFxyXG4gICAgICAgICAgICAvLyAgd2l0aG91dCBhbnkgc2hhcGVzLCBzbyBubyBuZWVkIHRvIGFkZCBpdCB0byB3b3JsZFxyXG4gICAgICAgICAgICBpZiAoYm9keS5zaGFwZXMgJiYgYm9keS5zaGFwZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgd3AyLmFkZEJvZHkoYm9keSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gIHNldCBzdGFydCBmb3IgcGxheWVyXHJcbiAgICAgICAgd3AyLnBsYXllckJvZHkucG9zaXRpb25bMF0gPSBzdGF0cy5jdXJyZW50TGV2ZWwuc3RhcnRbMF07XHJcbiAgICAgICAgd3AyLnBsYXllckJvZHkucG9zaXRpb25bMV0gPSBzdGF0cy5jdXJyZW50TGV2ZWwuc3RhcnRbMV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5xdWVzdE1uZ3IucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmhlcm8udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5Jc0hlcm9JbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5odWQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zY2VuZU1hbmFnZXIuQWN0aXZhdGVTY2VuZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgcGxheWVyIGludGVyYWN0aXZpdHkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgSXNIZXJvSW50ZXJhY3RpdmUodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5oZXJvLklzSW50ZXJhY3RpdmUgIT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVyby5Jc0ludGVyYWN0aXZlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oZXJvLklzSW50ZXJhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVyby5wbGF5KFwiaWRsZVwiLCBBTklNQVRJT05fRlBTX1NMT1cpO1xyXG4gICAgICAgICAgICAgICAgc25kLmlkbGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyBhbiBhbmltYXRpb24gdHdlZW4gYW5kIHJlbW92ZXMgdGhlIGRpc3BsYXkgb2JqZWN0ICYgYm9keSBmcm9tIHNjZW5lLlxyXG4gICAgICogQHBhcmFtIGRpc3BPYmpcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb2xsZWN0T2JqZWN0KGJvZHkpOiB2b2lkIHtcclxuICAgICAgICB2YXIgZGlzcE9iajogUElYSS5EaXNwbGF5T2JqZWN0ID0gYm9keS5EaXNwbGF5T2JqZWN0IGFzIFBJWEkuRGlzcGxheU9iamVjdDtcclxuXHJcbiAgICAgICAgdmFyIG9yZ1NjYWxlWCA9IGRpc3BPYmouc2NhbGUueDtcclxuICAgICAgICB2YXIgdXBYID0gZGlzcE9iai5wb3NpdGlvbi54ICsgNDU7XHJcbiAgICAgICAgdmFyIHVwWSA9IGRpc3BPYmoucG9zaXRpb24ueSArIDE2MDtcclxuXHJcbiAgICAgICAgdmFyIGVuZFggPSBkaXNwT2JqLnBvc2l0aW9uLnggLSBTQ0VORV9IQUxGX1dJRFRIO1xyXG4gICAgICAgIHZhciBlbmRZID0gU0NFTkVfSEVJR0hUO1xyXG5cclxuICAgICAgICB2YXIgbW92ZVVwID0gbmV3IFRXRUVOLlR3ZWVuKGRpc3BPYmoucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7IHg6IHVwWCwgeTogdXBZIH0sIDE1MCk7XHJcblxyXG4gICAgICAgIHZhciBzY2FsZSA9IG5ldyBUV0VFTi5Ud2VlbihkaXNwT2JqLnNjYWxlKVxyXG4gICAgICAgICAgICAudG8oeyB4OiBvcmdTY2FsZVggKyAwLjUsIHk6IG9yZ1NjYWxlWCArIDAuNSB9LCA1MDApXHJcbiAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lKTtcclxuXHJcbiAgICAgICAgdmFyIG1vdmVBd2F5ID0gbmV3IFRXRUVOLlR3ZWVuKGRpc3BPYmoucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC50byh7IHg6IGVuZFgsIHk6IGVuZFkgfSwgMjAwMClcclxuICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuQmFjay5JbilcclxuICAgICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4gdGhpcy53b3JsZENvbnRhaW5lci5yZW1vdmVDaGlsZChkaXNwT2JqKSk7XHJcblxyXG4gICAgICAgIG1vdmVVcC5jaGFpbihzY2FsZSwgbW92ZUF3YXkpLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVFbnRpdHkoYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIHBsYXllciBjb2xsaXNpb24gd2l0aCBpbnRlcmFjdGl2ZSBvYmplY3RzLlxyXG4gICAgICogQHBhcmFtIGJvZHlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVJbnRlcmFjdGl2ZUNvbGxpc2lvbihib2R5OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICB2YXIgZGlzcE9iajogUElYSS5EaXNwbGF5T2JqZWN0ID0gYm9keS5EaXNwbGF5T2JqZWN0IGFzIFBJWEkuRGlzcGxheU9iamVjdDtcclxuICAgICAgICBsZXQgaW50ZXJhY3Rpb25UeXBlOiBudW1iZXIgPSBib2R5LkRpc3BsYXlPYmplY3QuaW50ZXJhY3Rpb25UeXBlO1xyXG4gICAgICAgIHN3aXRjaCAoaW50ZXJhY3Rpb25UeXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gIHNtYWxsIGNvaW5cclxuICAgICAgICAgICAgICAgIHN0YXRzLmluY3JlYXNlU3RhdChTdGF0VHlwZS5Db2lucywgMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RPYmplY3QoYm9keSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmh1ZC5hZGRJbmZvTWVzc2FnZShkaXNwT2JqLnBvc2l0aW9uLCBcIisxIGNvaW5cIiwgTVNHX0NPSU5fU1RZTEUsIC0xMDApO1xyXG4gICAgICAgICAgICAgICAgc25kLmNvaW4oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAyOiAvLyAgY29pblxyXG4gICAgICAgICAgICAgICAgc3RhdHMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLkNvaW5zLCAxMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RPYmplY3QoYm9keSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmh1ZC5hZGRJbmZvTWVzc2FnZShkaXNwT2JqLnBvc2l0aW9uLCBcIisxMCBjb2luc1wiLCBNU0dfQ09JTl9TVFlMRSwgLTEwMCk7XHJcbiAgICAgICAgICAgICAgICBzbmQuY29pbigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDM6IC8vICBibHVlIGdlbVxyXG4gICAgICAgICAgICAgICAgc3RhdHMuaW5jcmVhc2VTdGF0KFN0YXRUeXBlLkNvaW5zLCAxMDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0T2JqZWN0KGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5odWQuYWRkSW5mb01lc3NhZ2UoZGlzcE9iai5wb3NpdGlvbiwgXCIrMTAwIGNvaW5zXCIsIE1TR19DT0lOX1NUWUxFLCAtMTAwKTtcclxuICAgICAgICAgICAgICAgIHNuZC5nZW0oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgLy8gIFFVRVNUIElURU1TIDIwMC05OTlcclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgMjAxOiAgLy8gIGtlbmRvIGtub3dsZWRnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5odWQuYWRkSW5mb01lc3NhZ2UoZGlzcE9iai5wb3NpdGlvbiwgXCJLZW5kbyBrbm93bGVkZ2UgYWNxdWlyZWQhXCIsIE1TR19DT0lOX1NUWUxFKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdE9iamVjdChib2R5KTtcclxuICAgICAgICAgICAgICAgIHNuZC5xdWVzdEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucXVlc3RNbmdyLmFjcXVpcmVJdGVtKDIwMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMjAyOiAgLy8gIEtJXHJcbiAgICAgICAgICAgICAgICB0aGlzLmh1ZC5hZGRJbmZvTWVzc2FnZShkaXNwT2JqLnBvc2l0aW9uLCBcIjEgS2kgYWNxdWlyZWQhXCIsIE1TR19DT0lOX1NUWUxFKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdE9iamVjdChib2R5KTtcclxuICAgICAgICAgICAgICAgIHNuZC5xdWVzdEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucXVlc3RNbmdyLmFjcXVpcmVJdGVtKDIwMik7XHJcbiAgICAgICAgICAgICAgICAvLyAgVE9ETzogcXVlc3QgbWFuYWdlclxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICAvLyAgT0JKRUNUUyBET0lORyBEQU1BR0UgMTAwMC0xOTk5XHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgIGNhc2UgRGFtYWdlVHlwZS5MYXZhQm9yZGVyOiAgLy8gIGJvcmRlciBsYXZhICAgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRzLmJ1ZmZzW0RhbWFnZVR5cGUuTGF2YUJvcmRlcl0gfHwgc3RhdHMuYnVmZnNbRGFtYWdlVHlwZS5MYXZhQm9yZGVyXSA8IG5vdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmh1ZC5hZGRJbmZvTWVzc2FnZShkaXNwT2JqLnBvc2l0aW9uLCBcIkJ1cm5pbmdcIiwgTVNHX1dBUk5fU1RZTEUsIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmJ1ZmZzW0RhbWFnZVR5cGUuTGF2YUJvcmRlcl0gPSB0aGlzLnNlY29uZHNGcm9tTm93KDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGFtYWdlVHlwZS5MYXZhOiAgLy8gIGxhdmFcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhdHMuYnVmZnNbRGFtYWdlVHlwZS5MYXZhXSB8fCBzdGF0cy5idWZmc1tEYW1hZ2VUeXBlLkxhdmFdIDwgbm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaHVkLmFkZEluZm9NZXNzYWdlKGRpc3BPYmoucG9zaXRpb24sIFwiQnVybmluZ1wiLCBNU0dfV0FSTl9TVFlMRSwgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuYnVmZnNbRGFtYWdlVHlwZS5MYXZhXSA9IHRoaXMuc2Vjb25kc0Zyb21Ob3coNCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgdGhhdCByZXR1cm5zIHRpbWUgdGljayB2YWx1ZSB3aXRoIHRoZSBnaXZlbiBzZWNvbmRzIGFkZGVkLlxyXG4gICAgICogQHBhcmFtIHNlY29uZHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzZWNvbmRzRnJvbU5vdyhzZWNvbmRzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHZhciBub3cgPSBwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDA7XHJcbiAgICAgICAgbm93ICs9IHNlY29uZHM7XHJcbiAgICAgICAgcmV0dXJuIG5vdztcclxuICAgIH0gICAgXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGVudGl0eSBmcm9tIHRoZSBwMiB3b3JsZCBhbmQgc2V0cyBpdHMgRGlzcGxheU9iamVjdCB0byBudWxsLlxyXG4gICAgICogSWYgdGhlIHJlbW92ZURpc3BsYXlPYmplY3QgaXMgdHJ1ZSB0aGUgZGlzcGxheSBvYmplY3Qgd2lsbCBiZSBhbHNvIHJlbW92ZWQgZnJvbSB0aGUgd29ybGRDb250YWluZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGJvZHlcclxuICAgICAqIEBwYXJhbSByZW1vdmVEaXNwbGF5T2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVFbnRpdHkoYm9keTogcDIuQm9keSwgcmVtb3ZlRGlzcGxheU9iamVjdDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgICAgd3AyLnJlbW92ZUJvZHkoYm9keSk7XHJcbiAgICAgICAgaWYgKHJlbW92ZURpc3BsYXlPYmplY3QpIHtcclxuICAgICAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lci5yZW1vdmVDaGlsZCgoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAoYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xlYXJMZXZlbCgpIHtcclxuICAgICAgICBpZiAoc3RhdHMuY3VycmVudExldmVsKSB7XHJcbiAgICAgICAgICAgIHN0YXRzLmN1cnJlbnRMZXZlbC5wYXJhbGxheC5mb3JFYWNoKChwbHg6IFBhcmFsbGF4LCBpZHg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lci5yZW1vdmVDaGlsZChwbHgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc3RhdHMuY3VycmVudExldmVsLmVudGl0aWVzLmZvckVhY2goKGJvZHk6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGJvZHkgIT09IHdwMi5wbGF5ZXJCb2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53b3JsZENvbnRhaW5lci5yZW1vdmVDaGlsZChib2R5LkRpc3BsYXlPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdwMi5yZW1vdmVCb2R5KGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkuRGlzcGxheU9iamVjdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gIG5vdyByZW1vdmUgYWxsIG90aGVyIGRpc3BsYXkgb2JqZWN0cyBleGNlcHQgaGVyb1xyXG4gICAgICAgICAgICB2YXIgYWxsID0gdGhpcy53b3JsZENvbnRhaW5lci5jaGlsZHJlbi5maWx0ZXIoKGM6IFBJWEkuRGlzcGxheU9iamVjdCkgPT4gYy5uYW1lICE9PSBcImhlcm9cIik7XHJcbiAgICAgICAgICAgIGFsbC5mb3JFYWNoKChjaGlsZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkQ29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdwMi5jbGVhckxldmVsKCk7XHJcbiAgICAgICAgICAgIEJ1bGxldC5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJhbmRvbVJhbmdlKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBtaW4gKyAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0R3JvdW5kU2hha2UgPSAoZXZlbnQ6IHttaWxsaVNlY29uZHM6IG51bWJlciwgbWFnbml0dWRlSW5QaXhlbHM6IG51bWJlcn0pPT4ge1xyXG4gICAgICAgIHRoaXMuc2hha2VFbmQgPSBwZXJmb3JtYW5jZS5ub3coKSArIGV2ZW50Lm1pbGxpU2Vjb25kcztcclxuICAgICAgICB0aGlzLm1hZ25pdHVkZSA9IGV2ZW50Lm1hZ25pdHVkZUluUGl4ZWxzO1xyXG4gICAgICAgIHRoaXMuc2hha2VEdXJhdGlvbiA9IGV2ZW50Lm1pbGxpU2Vjb25kcyAvIHRoaXMuU0hBS0VfQ09VTlQ7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBHbG9iYWwsIFBJWEksIFNjZW5lLCBCdXR0b24sIFNjZW5lTWFuYWdlciB9IGZyb20gXCIuLlwiO1xyXG5pbXBvcnQgeyBTQ0VORV9IQUxGX1dJRFRILCBURVhUX1NUWUxFLCBTQ0VORV9CQUNLQ09MT1IsIEJUTl9XSURUSCwgU0NFTkVfSEVJR0hULCBCVE5fSEVJR0hULCBCVE5fU1RZTEUgfSBmcm9tICcuLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqICAgTWFpbiBvcHRpb25zIEdVSS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBPcHRpb25zU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50TXVzaWNUcmFjazogbnVtYmVyID0gMDsgXHJcbiAgICBcclxuXHJcbiAgICAvKipcclxuICAgICAqICAgQ3JlYXRlcyBhIG5ldyBzY2VuZSBpbnN0YW5jZS5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2NtOlNjZW5lTWFuYWdlcikge1xyXG4gICAgICAgIHN1cGVyKHNjbSwgXCJPcHRpb25zXCIpO1xyXG4gICAgICAgIHRoaXMuQmFja0dyb3VuZENvbG9yID0gU0NFTkVfQkFDS0NPTE9SO1xyXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25BY3RpdmF0ZSA9KCk9PntcclxuICAgICAgICB2YXIgYnRuT3B0aW9ucyA9IHRoaXMuc2NlbmVNYW5hZ2VyLk1hc3Rlckh1ZE92ZXJsYXkuY2hpbGRyZW4uZmluZCgob2JqLCBpZHgpPT4gb2JqLm5hbWUgPT0gXCJCVE5fT1BUSU9OU1wiKTtcclxuICAgICAgICBidG5PcHRpb25zIS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb25EZWFjdGl2YXRlID0oKT0+e1xyXG4gICAgICAgIHZhciBidG5PcHRpb25zID0gdGhpcy5zY2VuZU1hbmFnZXIuTWFzdGVySHVkT3ZlcmxheS5jaGlsZHJlbi5maW5kKChvYmosIGlkeCk9PiBvYmoubmFtZSA9PSBcIkJUTl9PUFRJT05TXCIpO1xyXG4gICAgICAgIGJ0bk9wdGlvbnMhLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBzZXR1cCA9ICgpID0+IHtcclxuICAgICAgICB2YXIgdGl0bGUgPSBuZXcgUElYSS5UZXh0KFwiT3B0aW9uc1wiLCBURVhUX1NUWUxFKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRpdGxlKTtcclxuICAgICAgICB0aXRsZS5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgdGl0bGUueCA9IFNDRU5FX0hBTEZfV0lEVEg7XHJcbiAgICAgICAgdGl0bGUueSA9IDIwO1xyXG5cclxuICAgICAgICBsZXQgT0ZGU0VUID0gQlROX1dJRFRIIC8gMztcclxuICAgICAgICBsZXQgeSA9IFNDRU5FX0hFSUdIVCAtIEJUTl9IRUlHSFQgLSBPRkZTRVQ7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgYmFjayB0byBnYW1lXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciBidG5CYWNrID0gbmV3IEJ1dHRvbihcImFzc2V0cy9ndWktYXRsYXMuanNvbkBndWlfYnV0dG9uMS5wbmdcIiwgT0ZGU0VULCB5LCBCVE5fV0lEVEgsIEJUTl9IRUlHSFQpO1xyXG4gICAgICAgIGJ0bkJhY2sudGV4dCA9IG5ldyBQSVhJLlRleHQoXCJCYWNrIHRvIGdhbWVcIiwgQlROX1NUWUxFKTtcclxuICAgICAgICBidG5CYWNrLm9uQ2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZXNldFNvdW5kcygpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lTWFuYWdlci5BY3RpdmF0ZVByZXZpb3VzU2NlbmUoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoYnRuQmFjayk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgQ09MX0dSUF9QTEFZRVIgPSAxO1xyXG5leHBvcnQgY29uc3QgQ09MX0dSUF9OUEMgPSAyO1xyXG5leHBvcnQgY29uc3QgQ09MX0dSUF9TQ0VORSA9IDQ7XHJcbmV4cG9ydCBjb25zdCBDT0xfR1JQX0JVTExFVCA9IDg7XHJcbmV4cG9ydCBjb25zdCBDT0xfR1JQX0dST1VORCA9IDE2OyIsImltcG9ydCB7IElSb290T2JqZWN0LCBJTGV2ZWxEZWZpbml0aW9uLCBJVGVtcGxhdGUsIElNYXBFbnRpdHksIElNb2JFbnRpdHkgfSBmcm9tICcuL0xldmVsSW50ZXJmYWNlcyc7XHJcblxyXG4vKipcclxuKiBSZXR1cm5zIGFsbCBhc3NldHMgcmVmZXJlbmNlZCBpbiB0aGUgbGV2ZWwuXHJcbiogQHBhcmFtIHJvb3RcclxuKiBAcGFyYW0gbGV2ZWxJZFxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gR2V0TGV2ZWxBc3NldHMocm9vdDogSVJvb3RPYmplY3QsIGxldmVsSWQ6IG51bWJlcik6IHN0cmluZ1tdIHtcclxuICAgIHZhciBhc3NldHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgdmFyIGxldmVsOiBJTGV2ZWxEZWZpbml0aW9uID0gdW5kZWZpbmVkO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb290LmxldmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChyb290LmxldmVsc1tpXS5pZCA9PT0gbGV2ZWxJZCkge1xyXG4gICAgICAgICAgICBsZXZlbCA9IHJvb3QubGV2ZWxzW2ldO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGxldmVsKSB7XHJcbiAgICAgICAgbGV2ZWwucGFyYWxsYXguZm9yRWFjaCgoaXBseCkgPT4ge1xyXG4gICAgICAgICAgICBhc3NldHMgPSBhc3NldHMuY29uY2F0KGlwbHgudGV4dHVyZXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAobGV2ZWwuYXNzZXRzICYmIGxldmVsLmFzc2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQobGV2ZWwuYXNzZXRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICBtZXJnZSBnbG9iYWwgdGVtcGxhdGVzIHdpdGggbGV2ZWwgdGVtcGxhdGVzXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlcyA9IHJvb3QudGVtcGxhdGVzLmNvbmNhdChsZXZlbC5tYXAudGVtcGxhdGVzKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGFsbCB0ZXh0dXJlcyBmcm9tIHRlbXBsYXRlcyAod2UgZG9uJ3QgbmVlZCB0byBoYXZlIGVudGl0aWVzIHJlZmVyZW5jaW5nIHRoZSB0ZW1wbGF0ZSBpZiB0aGV5IGFyZSBpbiBhIHNwYXduKVxyXG4gICAgICAgIGxldmVsLm1hcC50ZW1wbGF0ZXMuZm9yRWFjaCgodG9zKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdG9zLnR5cGUgfHwgdG9zLnR5cGUgIT09IFwic3Bhd25fcG9pbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBsID0gdG9zIGFzIElUZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXNwT2JqID0gdGVtcGwuZGlzcGxheU9iamVjdDtcclxuICAgICAgICAgICAgICAgIGlmIChkaXNwT2JqLnRleHR1cmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRpc3BPYmoudGV4dHVyZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldHMucHVzaChkaXNwT2JqLnRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQoZGlzcE9iai50ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzcE9iai5zZXF1ZW5jZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwT2JqLnNlcXVlbmNlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0cy5wdXNoKGl0ZW0udGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV2ZWwubWFwLmVudGl0aWVzLmZvckVhY2goKGVudGl0eTogSU1hcEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGVmcyA9IGdldEVudGl0eURlZmluaXRpb24odGVtcGxhdGVzLCBlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAoZGVmcy5kb0RlZi50ZXh0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlZnMuZG9EZWYudGV4dHVyZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cy5wdXNoKGRlZnMuZG9EZWYudGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQoZGVmcy5kb0RlZi50ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVmcy5kb0RlZi5zZXF1ZW5jZXMpIHtcclxuICAgICAgICAgICAgICAgIGRlZnMuZG9EZWYuc2VxdWVuY2VzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NldHMucHVzaChpdGVtLnRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV2ZWwubWFwLk5QQyA9IGxldmVsLm1hcC5OUEMgfHwgW107XHJcbiAgICAgICAgbGV2ZWwubWFwLk5QQy5mb3JFYWNoKCh0b3M6IElNb2JFbnRpdHkpID0+IHtcclxuICAgICAgICAgICAgLy8gIGNoZWNrIGlmIGl0cyBhIHRlbXBsYXRlIG9yIHNwYXduX3BvaW50XHJcbiAgICAgICAgICAgIGlmICh0b3MudHlwZSAmJiB0b3MudHlwZSA9PT0gXCJzcGF3bl9wb2ludFwiKSB7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gIHRoaXMgaXMgYW4gZW50aXR5IGRlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGxldCBlbnRpdHk6IElNb2JFbnRpdHkgPSB0b3MgYXMgSU1vYkVudGl0eTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgY29uY2F0IGF0dGFjayAoc3RyaW5nIHwgc3RyaW5nW10pXHJcbiAgICAgICAgICAgICAgICBpZiAoZW50aXR5LmF0dGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQoZW50aXR5LmF0dGFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGVudGl0eVRlbXBsYXRlID0gdGVtcGxhdGVzLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5uYW1lID09PSBlbnRpdHkudGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVudGl0eVRlbXBsYXRlICYmIGVudGl0eVRlbXBsYXRlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBlbnRpdHlUZW1wbGF0ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgdGVtcCA9ICQuZXh0ZW5kKHRydWUsIHt9LCB0ZW1wbGF0ZS5kaXNwbGF5T2JqZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZGlzcGxheU9iamVjdERlZmluaXRpb24gPSAkLmV4dGVuZCh0ZW1wLCBlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbiA9IHsgLi4udGVtcGxhdGUuZGlzcGxheU9iamVjdCwgLi4uZW50aXR5IH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlPYmplY3REZWZpbml0aW9uLnRleHR1cmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi50ZXh0dXJlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldHMucHVzaChkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi50ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0cyA9IGFzc2V0cy5jb25jYXQoZGlzcGxheU9iamVjdERlZmluaXRpb24udGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi5hdHRhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzID0gYXNzZXRzLmNvbmNhdChkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi5hdHRhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXlPYmplY3REZWZpbml0aW9uLnNlcXVlbmNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi5zZXF1ZW5jZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGFkZCBvbmx5IGlmIHRleHR1cmUgZXhpc3RzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50ZXh0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzLnB1c2goaXRlbS50ZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIGNvbnZlcnQganNvbiBhdGxhcyBwcmVmaXhlZCB0ZXh0dXJlIG5hbWVzIHRvIG9ubHkganNvbiBmaWxlIG5hbWVzXHJcbiAgICBhc3NldHMgPSBhc3NldHMubWFwKChuYW1lKT0+IHtcclxuICAgICAgICBsZXQgaWR4ID0gbmFtZS5pbmRleE9mKCcuanNvbkAnKTsgICAgICAgIFxyXG4gICAgICAgIHJldHVybiBpZHggPiAwID8gbmFtZS5zdWJzdHIoMCwgaWR4ICsgNSkgOiBuYW1lO1xyXG4gICAgfSk7XHJcbiAgICBhc3NldHMgPSBnZXRVbmlxdWVJdGVtcyhhc3NldHMpO1xyXG4gICAgcmV0dXJuIGFzc2V0cztcclxufVxyXG5cclxuLyoqXHJcbiogUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyBleHRyYWN0ZWQgZGlzcGxheSBvYmplY3QgYW5kIGJvZHkgZGVmaW5pdGlvbnMuXHJcbiogQHBhcmFtIHRlbXBsYXRlc1xyXG4qIEBwYXJhbSBlbnRpdHlcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudGl0eURlZmluaXRpb24odGVtcGxhdGVzOiBBcnJheTxhbnk+LCBlbnRpdHk6IElNYXBFbnRpdHkgfCBJTW9iRW50aXR5KSB7XHJcbiAgICBsZXQgZGlzcGxheU9iamVjdERlZmluaXRpb24gPSBudWxsO1xyXG4gICAgbGV0IGJvZHlEZWZpbml0aW9uID0gbnVsbDtcclxuICAgIGxldCB0ZW1wbGF0ZSA9IHtcclxuICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgIGRpc3BsYXlPYmplY3Q6IHsgdHlwZU5hbWU6IFwiU3ByaXRlXCIgfSwgLy8gICAgc3ByaXRlIGlzIHRoZSBkZWZhdWx0IGlmIG5vIHRlbXBsYXRlIGV4aXN0c1xyXG4gICAgICAgIGJvZHk6IG51bGwsXHJcbiAgICAgICAgdHJpZ2dlcjogbnVsbCxcclxuICAgICAgICBkcm9wOiBudWxsXHJcbiAgICB9O1xyXG4gICAgdmFyIGVudGl0eVRlbXBsYXRlID0gdGVtcGxhdGVzLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5uYW1lID09PSBlbnRpdHkudGVtcGxhdGUpO1xyXG4gICAgaWYgKGVudGl0eVRlbXBsYXRlICYmIGVudGl0eVRlbXBsYXRlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0ZW1wbGF0ZSA9IGVudGl0eVRlbXBsYXRlWzBdO1xyXG4gICAgfVxyXG4gICAgZGlzcGxheU9iamVjdERlZmluaXRpb24gPSB7IC4uLnRlbXBsYXRlLmRpc3BsYXlPYmplY3QsIC4uLmVudGl0eSB9O1xyXG5cclxuICAgIGlmICh0ZW1wbGF0ZS5kcm9wKSB7XHJcbiAgICAgICAgZGlzcGxheU9iamVjdERlZmluaXRpb24gPSB7IC4uLmRpc3BsYXlPYmplY3REZWZpbml0aW9uLCBkcm9wOiB0ZW1wbGF0ZS5kcm9wIH1cclxuICAgIH1cclxuICAgIGlmICh0ZW1wbGF0ZS5ib2R5KSB7XHJcbiAgICAgICAgYm9keURlZmluaXRpb24gPSB0ZW1wbGF0ZS5ib2R5O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB0cmlnZ2VyVGVtcGxhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICBpZiAodGVtcGxhdGUudHJpZ2dlciB8fCBkaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi50cmlnZ2VyKSB7XHJcbiAgICAgICAgdHJpZ2dlclRlbXBsYXRlID0geyAuLi50ZW1wbGF0ZS50cmlnZ2VyLCAuLi5kaXNwbGF5T2JqZWN0RGVmaW5pdGlvbi50cmlnZ2VyIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlTmFtZTogdGVtcGxhdGUubmFtZSxcclxuICAgICAgICBkb0RlZjogZGlzcGxheU9iamVjdERlZmluaXRpb24sXHJcbiAgICAgICAgYmREZWY6IGJvZHlEZWZpbml0aW9uLFxyXG4gICAgICAgIHRyaWdnZXI6IHRyaWdnZXJUZW1wbGF0ZVxyXG4gICAgfTtcclxufVxyXG4vKipcclxuICogUmV0dXJucyBhIGZpbHRlcmVkIGFycmF5IHdpdGggdW5pcXVlIG9ubHkgaXRlbXMgZnJvbSB0aGUgaW5wdXQgYXJyYXlcclxuICogQHBhcmFtIGFyciBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlxdWVJdGVtcyhhcnIpIHtcclxuICAgIHZhciBuID0ge30sIHIgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFuW2FycltpXV0pIHtcclxuICAgICAgICAgICAgblthcnJbaV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgci5wdXNoKGFycltpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbiIsImltcG9ydCAqIGFzIEdsb2JhbCBmcm9tIFwiLi4vZ2xvYmFsXCI7XHJcbmltcG9ydCAqIGFzIHAyIGZyb20gXCJwMlwiO1xyXG5pbXBvcnQgeyBQYXJhbGxheCwgQW5pbWF0ZWRTcHJpdGUsIEFuaW1hdGlvblNlcXVlbmNlICB9IGZyb20gXCIuLlwiO1xyXG5pbXBvcnQgeyBDT0xfR1JQX1BMQVlFUiwgQ09MX0dSUF9HUk9VTkQsIENPTF9HUlBfTlBDLCBDT0xfR1JQX1NDRU5FLCBDT0xfR1JQX0JVTExFVCB9IGZyb20gXCIuL0NvbGxpc2lvbkdyb3Vwc1wiO1xyXG5pbXBvcnQgeyBTcGF3blBvaW50IH0gZnJvbSAnLi4vbW9icy9TcGF3blBvaW50JztcclxuaW1wb3J0IHsgTW9iIH0gZnJvbSAnLi4vbW9icy9Nb2InO1xyXG5pbXBvcnQgeyBJUm9vdE9iamVjdCwgSUxldmVsLCBJTGV2ZWxEZWZpbml0aW9uLCBJTWFwRW50aXR5LCBJTW9iRW50aXR5LCBJU3Bhd25Qb2ludCwgSURpc3BsYXlPYmplY3REZWZpbml0aW9uLCBJSW50ZXJhY3Rpb25UeXBlLCBJQm9keURlZmluaXRpb24gfSBmcm9tICcuL0xldmVsSW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IGdldEVudGl0eURlZmluaXRpb24gfSBmcm9tICcuL0xldmVsSGVscGVyJztcclxuaW1wb3J0IHsgU0NFTkVfSEVJR0hULCBTQ0VORV9XSURUSCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IERpY3Rpb25hcnksIFRleHR1cmVMb2FkZXIgfSBmcm9tICcuLi9fZW5naW5lJztcclxuXHJcbmRlY2xhcmUgdHlwZSBGbiA9IChkZWZpbml0aW9uOiBJRGlzcGxheU9iamVjdERlZmluaXRpb24pID0+IFBJWEkuRGlzcGxheU9iamVjdDtcclxuXHJcbmV4cG9ydCBjbGFzcyBMZXZlbExvYWRlciB7XHJcbiAgICBcclxuICAgIHByaXZhdGUgZ2FtZUxldmVsczogSVJvb3RPYmplY3Q7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBmYWN0b3J5TGlzdCA9IG5ldyBEaWN0aW9uYXJ5PEZuPigpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdhbWVMZXZlbHM6IElSb290T2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTGV2ZWxzID0gZ2FtZUxldmVscztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVycyBjdXN0b20gZmFjdG9yeSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgZGlzcGxheSBvYmplY3RzLlxyXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIGVudGl0eSBuYW1lIHVzZWQgaW4gbGV2ZWwgZGVmaW5pdGlvblxyXG4gICAgICogQHBhcmFtIGZhY3RvcnkgZmFjdG9yeSBmdW5jdGlvbiByZXR1cm5pbmcgYSBkaXNwbGF5IG9iamVjdCBiYXNlZCBvbiB0aGUgZ2l2ZW4gZGVmaW5pdGlvblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyRmFjdG9yeShuYW1lOnN0cmluZywgZmFjdG9yeTpGbil7XHJcbiAgICAgICAgdGhpcy5mYWN0b3J5TGlzdC5zZXQobmFtZSwgZmFjdG9yeSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkcyB0aGUgbGV2ZWwuXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnVpbGRMZXZlbChpZDogbnVtYmVyKTogSUxldmVsIHtcclxuXHJcbiAgICAgICAgLy8gIGZpbmQgdGhlIGxldmVsIGJ5IGl0cyBpZFxyXG4gICAgICAgIHZhciBsZXZlbERlZmluaXRpb246IElMZXZlbERlZmluaXRpb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdhbWVMZXZlbHMubGV2ZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWVMZXZlbHMubGV2ZWxzW2ldLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWxEZWZpbml0aW9uID0gdGhpcy5nYW1lTGV2ZWxzLmxldmVsc1tpXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgY3JlYXRlIGxldmVsIG9iamVjdHNcclxuICAgICAgICB2YXIgcmVzdWx0OiBJTGV2ZWw7XHJcbiAgICAgICAgaWYgKGxldmVsRGVmaW5pdGlvbikge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmNyZWF0ZUxldmVsKGxldmVsRGVmaW5pdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVMZXZlbChsZXZlbDogSUxldmVsRGVmaW5pdGlvbik6IElMZXZlbCB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDogSUxldmVsID0ge1xyXG4gICAgICAgICAgICBwYXJhbGxheDogW10sXHJcbiAgICAgICAgICAgIGVudGl0aWVzOiBbXSxcclxuICAgICAgICAgICAgc3RhcnQ6IFtdLFxyXG4gICAgICAgICAgICBhdWRpb1RyYWNrOiBsZXZlbC5hdWRpb1RyYWNrLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZXM6IFtdLFxyXG4gICAgICAgICAgICBzcGF3blBvaW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIGNyZWF0ZSBwYXJhbGxheCBvYmplY3RzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgICAgICAgICAgIFxyXG4gICAgICAgIHZhciB2cHMgPSBuZXcgUElYSS5Qb2ludChTQ0VORV9XSURUSCwgU0NFTkVfSEVJR0hUKTtcclxuICAgICAgICBsZXZlbC5wYXJhbGxheC5mb3JFYWNoKChpcGx4KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbGxheCA9IG5ldyBQYXJhbGxheCh2cHMsIGlwbHgucGFyYWxsYXhGYWN0b3IsIGlwbHgudGV4dHVyZXMsIGlwbHguc2NhbGUpO1xyXG4gICAgICAgICAgICBwYXJhbGxheC55ID0gaXBseC55O1xyXG4gICAgICAgICAgICByZXN1bHQucGFyYWxsYXgucHVzaChwYXJhbGxheCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgbWVyZ2UgZ2xvYmFsIHdpdGggbGV2ZWwgdGVtcGxhdGVzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciB0ZW1wbGF0ZXMgPSBHbG9iYWwuTGV2ZWxEZWZpbml0aW9ucy50ZW1wbGF0ZXMuY29uY2F0KGxldmVsLm1hcC50ZW1wbGF0ZXMpO1xyXG4gICAgICAgIHJlc3VsdC50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgY3JlYXRlIGRpc3BsYXkvcGh5c2ljcyBvYmplY3QgcGFpcnNcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbGV2ZWwubWFwLmVudGl0aWVzLmZvckVhY2goKGVudGl0eTogSU1hcEVudGl0eSwgaWR4LCBhcnIpID0+IHtcclxuICAgICAgICAgICAgbGV0IHAyYm9keSA9IExldmVsTG9hZGVyLmNyZWF0ZUVudGl0eSh0ZW1wbGF0ZXMsIGVudGl0eSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJlc3VsdC5lbnRpdGllcy5wdXNoKHAyYm9keSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyAgY3JlYXRlIE5QQydzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIGxldmVsLm1hcC5OUEMgPSBsZXZlbC5tYXAuTlBDIHx8IFtdO1xyXG4gICAgICAgIGxldmVsLm1hcC5OUEMuZm9yRWFjaCgobnBjOiBJTW9iRW50aXR5LCBpZHgsIGFycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAobnBjLnR5cGUgJiYgbnBjLnR5cGUgPT09IFwic3Bhd25fcG9pbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwID0gPGFueT5ucGMgYXMgSVNwYXduUG9pbnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gc3AuZW50aXR5O1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnNwYXduUG9pbnRzLnB1c2gobmV3IFNwYXduUG9pbnQoc3AubmFtZSwgc3AueHlbMF0sIHNwLnh5WzFdLCBzcC5hcmVhLCBzcC5tYXhNb2JDb3VudCwgc3AucmVzcGF3blNlY29uZHMsIGVudGl0eSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHAyYm9keSA9IExldmVsTG9hZGVyLmNyZWF0ZU1vYih0ZW1wbGF0ZXMsIG5wYyk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmVudGl0aWVzLnB1c2gocDJib2R5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc3VsdC5zdGFydCA9IGxldmVsLm1hcC5zdGFydDtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRW50aXR5KHRlbXBsYXRlczogQXJyYXk8YW55PiwgZW50aXR5OiBJTWFwRW50aXR5KTogcDIuQm9keSB7XHJcbiAgICAgICAgbGV0IGRlZnMgPSBnZXRFbnRpdHlEZWZpbml0aW9uKHRlbXBsYXRlcywgZW50aXR5KTtcclxuXHJcbiAgICAgICAgLy8gIGRpc3BsYXkgb2JqZWN0XHJcbiAgICAgICAgbGV0IGRpc3BPYmo6IFBJWEkuRGlzcGxheU9iamVjdCA9IExldmVsTG9hZGVyLmJ1aWxkRGlzcGxheU9iamVjdChkZWZzLmRvRGVmKTtcclxuICAgICAgICBkaXNwT2JqLm5hbWUgPSBlbnRpdHkubmFtZSB8fCBlbnRpdHkudGVtcGxhdGU7XHJcbiAgICAgICAgKGRpc3BPYmogYXMgYW55KS50ZW1wbGF0ZU5hbWUgPSBkZWZzLnRlbXBsYXRlTmFtZTtcclxuXHJcbiAgICAgICAgLy8gIGJvZHlcclxuICAgICAgICB2YXIgcDJib2R5OiBwMi5Cb2R5O1xyXG4gICAgICAgIGlmIChkZWZzLmJkRGVmKSB7XHJcbiAgICAgICAgICAgIHAyYm9keSA9IExldmVsTG9hZGVyLmJ1aWxkUGh5c2ljc09iamVjdChkZWZzLmJkRGVmLCBkaXNwT2JqKTtcclxuICAgICAgICAgICAgcDJib2R5LnNoYXBlcy5ldmVyeSgoczogcDIuU2hhcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkZWZzLmJkRGVmLmNvbGxpc2lvblR5cGUgPT09IFwiZ3JvdW5kXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLmNvbGxpc2lvbkdyb3VwID0gQ09MX0dSUF9HUk9VTkQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5jb2xsaXNpb25NYXNrID0gQ09MX0dSUF9QTEFZRVIgfCBDT0xfR1JQX05QQyB8IENPTF9HUlBfU0NFTkUgfCBDT0xfR1JQX0JVTExFVDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5jb2xsaXNpb25Hcm91cCA9IENPTF9HUlBfU0NFTkU7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5jb2xsaXNpb25NYXNrID0gQ09MX0dSUF9QTEFZRVIgfCBDT0xfR1JQX05QQyB8IENPTF9HUlBfU0NFTkUgfCBDT0xfR1JQX0dST1VORDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgKHAyYm9keSBhcyBhbnkpLkRpc3BsYXlPYmplY3QgPSBkaXNwT2JqO1xyXG5cclxuICAgICAgICAgICAgLy8gIHRyaWdnZXJcclxuICAgICAgICAgICAgaWYgKGRlZnMudHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgKHAyYm9keSBhcyBhbnkpLlRyaWdnZXIgPSBkZWZzLnRyaWdnZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwMmJvZHkgPSBuZXcgcDIuQm9keSgpO1xyXG4gICAgICAgICAgICAocDJib2R5IGFzIGFueSkuRGlzcGxheU9iamVjdCA9IGRpc3BPYmo7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwMmJvZHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVNb2IodGVtcGxhdGVzOiBBcnJheTxhbnk+LCBlbnRpdHk6IElNb2JFbnRpdHkpOiBwMi5Cb2R5IHtcclxuICAgICAgICBsZXQgZGVmcyA9IGdldEVudGl0eURlZmluaXRpb24odGVtcGxhdGVzLCBlbnRpdHkpO1xyXG5cclxuICAgICAgICAvLyAgZGlzcGxheSBvYmplY3RcclxuICAgICAgICBsZXQgbW9iRGlzcE9iajogTW9iID0gTGV2ZWxMb2FkZXIuYnVpbGREaXNwbGF5T2JqZWN0KGRlZnMuZG9EZWYpIGFzIE1vYjtcclxuICAgICAgICBtb2JEaXNwT2JqLm5hbWUgPSBlbnRpdHkubmFtZSB8fCBlbnRpdHkudGVtcGxhdGU7XHJcbiAgICAgICAgKG1vYkRpc3BPYmogYXMgYW55KS50ZW1wbGF0ZU5hbWUgPSBkZWZzLnRlbXBsYXRlTmFtZTtcclxuXHJcbiAgICAgICAgLy8gYXR0cmlidXRlcyBhbmQgQUlcclxuICAgICAgICBtb2JEaXNwT2JqLmF0dHJpYnV0ZXMgPSBlbnRpdHkuYXR0cmlidXRlcyB8fCBkZWZzLmRvRGVmLmF0dHJpYnV0ZXMgfHwgW107XHJcbiAgICAgICAgbW9iRGlzcE9iai5jcmVhdGVBSShlbnRpdHkuYWkgfHwgXCJiYXNpY19zdGF0aWNcIik7XHJcbiAgICAgICAgbW9iRGlzcE9iai5hdGtUZXh0dXJlID0gZW50aXR5LmF0dGFjayB8fCBkZWZzLmRvRGVmLmF0dGFjaztcclxuXHJcbiAgICAgICAgLy8gIGJvZHkgICAgICAgIFxyXG4gICAgICAgIGRlZnMuYmREZWYubWF0ZXJpYWwgPSBkZWZzLmJkRGVmLm1hdGVyaWFsIHx8IFwibW9iX2RlZmF1bHRcIjtcclxuICAgICAgICB2YXIgcDJib2R5OiBwMi5Cb2R5ID0gTGV2ZWxMb2FkZXIuYnVpbGRQaHlzaWNzT2JqZWN0KGRlZnMuYmREZWYsIG1vYkRpc3BPYmopO1xyXG4gICAgICAgIHAyYm9keS5zaGFwZXMuZXZlcnkoKHM6IHAyLlNoYXBlKSA9PiB7XHJcbiAgICAgICAgICAgIHMuY29sbGlzaW9uR3JvdXAgPSBDT0xfR1JQX05QQztcclxuICAgICAgICAgICAgcy5jb2xsaXNpb25NYXNrID0gQ09MX0dSUF9QTEFZRVIgfCBDT0xfR1JQX0dST1VORCB8IENPTF9HUlBfU0NFTkU7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIChwMmJvZHkgYXMgYW55KS5EaXNwbGF5T2JqZWN0ID0gbW9iRGlzcE9iajtcclxuXHJcbiAgICAgICAgLy8gIHRyaWdnZXJcclxuICAgICAgICBpZiAoZGVmcy50cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgIChwMmJvZHkgYXMgYW55KS5UcmlnZ2VyID0gZGVmcy50cmlnZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHAyYm9keTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBkaXNwbGF5IG9iamVjdCBmcm9tIHRoZSBkZWZpbml0aW9uLlxyXG4gICAgICogQHBhcmFtIGRlZmluaXRpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYnVpbGREaXNwbGF5T2JqZWN0KGRlZmluaXRpb246IElEaXNwbGF5T2JqZWN0RGVmaW5pdGlvbik6IFBJWEkuRGlzcGxheU9iamVjdCB7XHJcbiAgICAgICAgdmFyIGRpc3BPYmo6IFBJWEkuRGlzcGxheU9iamVjdDtcclxuICAgICAgICBzd2l0Y2ggKGRlZmluaXRpb24udHlwZU5hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcIk1vYlwiOlxyXG4gICAgICAgICAgICAgICAgbGV0IG1vYiA9IG5ldyBNb2IoZGVmaW5pdGlvbi50ZXh0dXJlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAvLyAgaWYgYW5pbWF0aW9ucyBhcmUgZGVmaW5lZCBpbiB0aGUganNvbiByZXBsYWNlIHRoZSBidWlsdC1pbiBtb2IgYW5pbWF0aW9uc1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uc2VxdWVuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9iLmNsZWFyQW5pbWF0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24uc2VxdWVuY2VzLmZvckVhY2goKHNlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dHVyZU5hbWUgPSBzZXEudGV4dHVyZSB8fCBkZWZpbml0aW9uLnRleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhc2VxID0gbmV3IEFuaW1hdGlvblNlcXVlbmNlKHNlcS5uYW1lLCB0ZXh0dXJlTmFtZSBhcyBzdHJpbmcsIHNlcS5mcmFtZXMsIHNlcS5mcmFtZXNpemVbMF0sIHNlcS5mcmFtZXNpemVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2IuYWRkQW5pbWF0aW9ucyhhc2VxKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBtb2IucGxheShkZWZpbml0aW9uLnNlcXVlbmNlc1swXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmZwcykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vYi5mcHMgPSBkZWZpbml0aW9uLmZwcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vYi5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICAgICAgICAgIChtb2IgYXMgYW55KS50eXBlTmFtZSA9IFwiTW9iXCI7XHJcbiAgICAgICAgICAgICAgICBkaXNwT2JqID0gbW9iO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwiU2Vuc29yXCI6XHJcbiAgICAgICAgICAgICAgICBkaXNwT2JqID0gbmV3IFBJWEkuRGlzcGxheU9iamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgKGRpc3BPYmogYXMgYW55KS50eXBlTmFtZSA9IFwiU2Vuc29yXCI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJBbmltYXRlZFNwcml0ZVwiOlxyXG4gICAgICAgICAgICAgICAgdmFyIGFzcHIgPSBuZXcgQW5pbWF0ZWRTcHJpdGUoKTtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24uc2VxdWVuY2VzLmZvckVhY2goKHNlcSwgaWR4LCBhcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXNlcSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZShzZXEubmFtZSwgc2VxLnRleHR1cmUsIHNlcS5mcmFtZXMsIHNlcS5mcmFtZXNpemVbMF0sIHNlcS5mcmFtZXNpemVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzcHIuYWRkQW5pbWF0aW9ucyhhc2VxKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYXNwci5wbGF5KGRlZmluaXRpb24uc2VxdWVuY2VzWzBdLm5hbWUsIGRlZmluaXRpb24uZnBzKTtcclxuICAgICAgICAgICAgICAgIGFzcHIuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgICAgICAoYXNwciBhcyBhbnkpLnR5cGVOYW1lID0gXCJBbmltYXRlZFNwcml0ZVwiO1xyXG4gICAgICAgICAgICAgICAgZGlzcE9iaiA9IGFzcHI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJTcHJpdGVcIjpcclxuICAgICAgICAgICAgICAgIHZhciBzcHJUZXh0dXJlID0gVGV4dHVyZUxvYWRlci5HZXQoZGVmaW5pdGlvbi50ZXh0dXJlIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3ByID0gbmV3IFBJWEkuU3ByaXRlKHNwclRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmFuY2hvciA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24uYW5jaG9yID0gMC41O1xyXG4gICAgICAgICAgICAgICAgc3ByLmFuY2hvci5zZXQoZGVmaW5pdGlvbi5hbmNob3IpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLnBpdm90ID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbi5waXZvdCA9IDAuNTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5zY2FsZSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24uc2NhbGUgPSBbMSwgLTFdO1xyXG5cclxuICAgICAgICAgICAgICAgIHNwci5waXZvdC5zZXQoZGVmaW5pdGlvbi5waXZvdCk7XHJcbiAgICAgICAgICAgICAgICAoc3ByIGFzIGFueSkudHlwZU5hbWUgPSBcIlNwcml0ZVwiO1xyXG4gICAgICAgICAgICAgICAgZGlzcE9iaiA9IHNwcjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gY2FzZSBcIkJhbGxvb25cIjpcclxuICAgICAgICAgICAgLy8gICAgIHZhciBibG4gPSBuZXcgQmFsbG9vbigpO1xyXG4gICAgICAgICAgICAvLyAgICAgZGlzcE9iaiA9IGJsbjtcclxuICAgICAgICAgICAgLy8gICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gY2FzZSBcIkJ1bXBlclwiOlxyXG4gICAgICAgICAgICAvLyAgICAgdmFyIGJtcCA9IG5ldyBCdW1wZXIoKTtcclxuICAgICAgICAgICAgLy8gICAgIGJtcC5hbmNob3Iuc2V0KDAuNSk7XHJcbiAgICAgICAgICAgIC8vICAgICBkaXNwT2JqID0gYm1wO1xyXG4gICAgICAgICAgICAvLyAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB2YXIgZmFjdG9yeSA9IHRoaXMuZmFjdG9yeUxpc3QuZ2V0KGRlZmluaXRpb24udHlwZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYoZmFjdG9yeSlcclxuICAgICAgICAgICAgICAgICAgICBkaXNwT2JqID0gZmFjdG9yeShkZWZpbml0aW9uKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkZhY3Rvcnkgbm90IGZvdW5kIGZvciBvYmplY3QgbmFtZTogXCIgKyBkZWZpbml0aW9uLnR5cGVOYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbi52aXNpYmxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGlzcE9iai52aXNpYmxlID0gZGVmaW5pdGlvbi52aXNpYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkaXNwT2JqLnJvdGF0aW9uID0gZGVmaW5pdGlvbi5yb3RhdGlvbiB8fCAwO1xyXG4gICAgICAgIGlmIChkZWZpbml0aW9uLnh5KSB7XHJcbiAgICAgICAgICAgIGRpc3BPYmoucG9zaXRpb24uc2V0KGRlZmluaXRpb24ueHlbMF0sIGRlZmluaXRpb24ueHlbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5zY2FsZSkge1xyXG4gICAgICAgICAgICBkaXNwT2JqLnNjYWxlLnNldChkZWZpbml0aW9uLnNjYWxlWzBdLCBkZWZpbml0aW9uLnNjYWxlWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlZmluaXRpb24uaW50ZXJhY3Rpb25UeXBlKSB7XHJcbiAgICAgICAgICAgIChkaXNwT2JqIGFzIElJbnRlcmFjdGlvblR5cGUpLmludGVyYWN0aW9uVHlwZSA9IGRlZmluaXRpb24uaW50ZXJhY3Rpb25UeXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5kcm9wKSB7XHJcbiAgICAgICAgICAgIChkaXNwT2JqIGFzIElJbnRlcmFjdGlvblR5cGUpLmRyb3AgPSBkZWZpbml0aW9uLmRyb3A7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWZpbml0aW9uLnRpbnQpIHtcclxuICAgICAgICAgICAgKGRpc3BPYmogYXMgYW55KS50aW50ID0gcGFyc2VJbnQoZGVmaW5pdGlvbi50aW50LCAxNik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkaXNwT2JqO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIHBoeXNpY3MgYm9keSBhbmQgc2hhcGUgZnJvbSB0aGUgZGVmaW5pdGlvbi5cclxuICAgICAqIEBwYXJhbSBkZWZpbml0aW9uXHJcbiAgICAgKiBAcGFyYW0gZGlzcE9iaiB0aGUgZGlzcGxheSBvYmplY3QgdG8gcmV0cmlldmUgdGhlIGRlZmF1bHRzIGZyb20uXHJcbiAgICAgKiBAcGFyYW0gcHJldmVudFNlbnNvciBpZiB0cnVlIGEgbm9uIHNlbnNvciBib2R5IHdpbGwgYmUgY3JlYXRlZCAodGhpcyBpcyB0byBzdXBwb3J0IG1vYnNcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIHRoYXQgbXVzdCBoYXZlIG5vcm1hbCBib2RpZXMgYnV0IGFsc28gYW4gaW50ZXJhY3Rpb25UeXBlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBidWlsZFBoeXNpY3NPYmplY3QoZGVmaW5pdGlvbjogSUJvZHlEZWZpbml0aW9uLCBkaXNwT2JqOiBQSVhJLkRpc3BsYXlPYmplY3QsIHByZXZlbnRTZW5zb3I6IGJvb2xlYW4gPSBmYWxzZSk6IHAyLkJvZHkge1xyXG4gICAgICAgIHZhciBib2R5OiBwMi5Cb2R5O1xyXG4gICAgICAgIGxldCB3ID0gMCwgaCA9IDA7XHJcbiAgICAgICAgaWYgKGRlZmluaXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIG9wdGlvbnM6IHAyLkJvZHlPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgbWFzczogZGVmaW5pdGlvbi5tYXNzLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGRlZmluaXRpb24ueHkgPyBkZWZpbml0aW9uLnh5IDogW2Rpc3BPYmoueCwgZGlzcE9iai55XSxcclxuICAgICAgICAgICAgICAgIGFuZ2xlOiBkZWZpbml0aW9uLmFuZ2xlIHx8IGRpc3BPYmoucm90YXRpb24sXHJcbiAgICAgICAgICAgICAgICBmaXhlZFJvdGF0aW9uOiBkZWZpbml0aW9uLmZpeGVkUm90YXRpb24gfHwgZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyRGFtcGluZzogZGVmaW5pdGlvbi5hbmd1bGFyRGFtcGluZyB8fCAwLjEsXHJcbiAgICAgICAgICAgICAgICBkYW1waW5nOiBkZWZpbml0aW9uLmRhbXBpbmcgfHwgMC4xLFxyXG4gICAgICAgICAgICB9IGFzIHAyLkJvZHlPcHRpb25zO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYm9keSA9IG5ldyBwMi5Cb2R5KG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBib2R5LnR5cGUgPSBkZWZpbml0aW9uLnR5cGUgfHwgcDIuQm9keS5LSU5FTUFUSUM7IC8qIERZTkFNSUMgPSAxLCBEWU5BTUlDID0gMSwgU1RBVElDID0gMiAqL1xyXG4gICAgICAgICAgICB2YXIgZGlzcE9iakFzQW55OiBhbnkgPSBkaXNwT2JqIGFzIGFueTtcclxuICAgICAgICAgICAgdmFyIHNoYXBlOiBwMi5TaGFwZTtcclxuICAgICAgICAgICAgc3dpdGNoIChkZWZpbml0aW9uLnNoYXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2lyY2xlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJhZGl1cyA9IDMyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLnNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uc2l6ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1cyA9IGRlZmluaXRpb24uc2l6ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1cyA9IGRlZmluaXRpb24uc2l6ZSBhcyBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXMgPSBkaXNwT2JqQXNBbnkud2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlID0gbmV3IHAyLkNpcmNsZSh7IHJhZGl1czogcmFkaXVzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJQbGF0Zm9ybVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLnNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IGRlZmluaXRpb24uc2l6ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCA9IGRlZmluaXRpb24uc2l6ZVsxXTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gTWF0aC5hYnMoZGlzcE9iakFzQW55LndpZHRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCA9IE1hdGguYWJzKGRpc3BPYmpBc0FueS5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzaGFwZSA9IG5ldyBwMi5Cb3goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgdGhlIHBvc2l0aW9uIGlzIGNlbnRlcmVkIGJ1dCB3ZSBuZWVkIGl0IHRvIGJlIGxlZnQgdG9wIGFsaWduZWRcclxuICAgICAgICAgICAgICAgICAgICBib2R5LnBvc2l0aW9uWzBdID0gYm9keS5wb3NpdGlvblswXSArIHcgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucG9zaXRpb25bMV0gPSBib2R5LnBvc2l0aW9uWzFdIC0gaCAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIkJveFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vICBnZXQgdGhlIHNpemVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5zaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBkZWZpbml0aW9uLnNpemVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGggPSBkZWZpbml0aW9uLnNpemVbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BPYmpBc0FueS53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdyA9IE1hdGguYWJzKGRpc3BPYmpBc0FueS53aWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gTWF0aC5hYnMoZGlzcE9iakFzQW55LmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgVE9ETzogY2hlY2sgdGhpcyAtIHNlZW1zIG5vdCB0byBnZXQgY29ycmVjdCBib3VuZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBkaXNwT2JqLnNjYWxlLnggKiBkaXNwT2JqLmdldExvY2FsQm91bmRzKCkud2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gZGlzcE9iai5zY2FsZS55ICogZGlzcE9iai5nZXRMb2NhbEJvdW5kcygpLmhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzaGFwZSA9IG5ldyBwMi5Cb3goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgLy8gIFRPRE86IGltcGxlbWVudCBvdGhlciBzaGFwZXMgaWYgbmVlZGVkXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAoc2hhcGUgYXMgYW55KS5tYXRlcmlhbE5hbWUgPSBkZWZpbml0aW9uLm1hdGVyaWFsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXByZXZlbnRTZW5zb3IgJiYgISEoZGlzcE9iaiBhcyBJSW50ZXJhY3Rpb25UeXBlKS5pbnRlcmFjdGlvblR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHNoYXBlLnNlbnNvciA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBib2R5LnR5cGUgPSBwMi5Cb2R5LlNUQVRJQztcclxuICAgICAgICAgICAgICAgIGJvZHkuY29sbGlzaW9uUmVzcG9uc2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGJvZHkuc2V0RGVuc2l0eSgwLjApOyAvLyAgIHRoaXMgaXMgdG8gcHJldmVudCBib2R5IGltcGFjdHMgb24gcGxheWVyIGNvbGxpZGUgKG1ha2VzIG5vIHNlbnNlIGFzIGl0IGlzIGEgc2Vuc29yLCBidWcgbWF5YmU/KVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkIGNvbGxlY3RpYmxlIHNlbnNvclwiLCBzaGFwZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGRpc3BPYmogYXMgYW55KS50eXBlTmFtZSA9PT0gXCJTZW5zb3JcIikge1xyXG4gICAgICAgICAgICAgICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJvZHkudHlwZSA9IHAyLkJvZHkuU1RBVElDO1xyXG4gICAgICAgICAgICAgICAgYm9keS5jb2xsaXNpb25SZXNwb25zZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgYm9keS5zZXREZW5zaXR5KDAuMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGJvZHkuYWRkU2hhcGUoc2hhcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYm9keTtcclxuICAgIH1cclxufSIsImltcG9ydCB7SG93bH0gZnJvbSBcImhvd2xlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNvdW5kTWFuIHtcclxuICAgIHByaXZhdGUgYmFja2dyb3VuZFNuZDogSG93bDtcclxuICAgIHByaXZhdGUgd2Fsa1NuZDogSG93bDtcclxuICAgIHByaXZhdGUganVtcFNuZDE6IEhvd2w7XHJcbiAgICBwcml2YXRlIGp1bXBTbmQyOiBIb3dsO1xyXG4gICAgcHJpdmF0ZSBidXJuU25kOiBIb3dsO1xyXG4gICAgcHJpdmF0ZSBjb2luU25kOiBIb3dsO1xyXG4gICAgcHJpdmF0ZSBnZW1TbmQ6IEhvd2w7XHJcbiAgICBwcml2YXRlIGh1cnRTbmQ6IEhvd2w7XHJcbiAgICBwcml2YXRlIHdpblNuZDogSG93bDtcclxuICAgIHByaXZhdGUgYXRrTWFnMTogSG93bDtcclxuICAgIHByaXZhdGUgaGl0TWFnMTogSG93bDtcclxuICAgIHByaXZhdGUganVtcEF0azogSG93bDtcclxuICAgIHByaXZhdGUgd29vc2g6IEhvd2w7XHJcbiAgICBwcml2YXRlIHNxdWlzaDogSG93bDtcclxuICAgIHByaXZhdGUgcGFpbjogSG93bDtcclxuICAgIHByaXZhdGUgam1wQ29udGFjdDogSG93bDtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBmeERlbW9TbmQ6IEhvd2w7XHJcblxyXG4gICAgcHJpdmF0ZSBxdWVzdEl0ZW1TbmQ6IEhvd2w7XHJcblxyXG4gICAgcHJpdmF0ZSBtdXNpY1RyYWNrTmFtZXM6IEFycmF5PHN0cmluZz4gPSBbXHJcbiAgICAgICAgJ2Fzc2V0cy9hdWRpby9Ud28tRmluZ2VyLUpvaG5ueS5tcDMnLFxyXG4gICAgICAgICdhc3NldHMvYXVkaW8vQnVtYmxpbmctQnVyZ2xhcnNfTG9vcGluZy5tcDMnLFxyXG4gICAgICAgICdhc3NldHMvYXVkaW8vQmFtYS1Db3VudHJ5Lm1wMycsXHJcbiAgICAgICAgJ2Fzc2V0cy9hdWRpby9CZWFjaGZyb250LUNlbGVicmF0aW9uLm1wMycsXHJcbiAgICAgICAgJ2Fzc2V0cy9hdWRpby9FYXN5LUphbS5tcDMnLFxyXG4gICAgICAgICdhc3NldHMvYXVkaW8vV2hpc2tleS1vbi10aGUtTWlzc2lzc2lwcGkubXAzJyxcclxuICAgICAgICAnYXNzZXRzL2F1ZGlvL1ppZ1phZy5tcDMnLFxyXG4gICAgICAgICdhc3NldHMvYXVkaW8vQ2Fycm91c2VsLm1wMycsXHJcbiAgICAgICAgJ2Fzc2V0cy9hdWRpby9EaXNjby1CcmVhay5tcDMnXHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBtdXNpY1RyYWNrczogQXJyYXk8SG93bD4gPSBbXTtcclxuICAgIHByaXZhdGUgY3VycmVudFRyYWNrOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLm11c2ljVHJhY2tOYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdHJhY2tOYW1lID0gdGhpcy5tdXNpY1RyYWNrTmFtZXNbaV07XHJcbiAgICAgICAgICAgIHRoaXMubXVzaWNUcmFja3MucHVzaChuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6IFt0cmFja05hbWVdLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZvbHVtZTogMC42XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMud2Fsa1NuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL3N0ZXAubXAzJ10sXHJcbiAgICAgICAgICAgIHByZWxvYWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuanVtcFNuZDEgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgIHNyYzogWydhc3NldHMvYXVkaW8vZWZmZWN0cy9qdW1wMS5tcDMnXSxcclxuICAgICAgICAgICAgcHJlbG9hZDogdHJ1ZSxcclxuICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5qdW1wU25kMiA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL2p1bXAyLm1wMyddLFxyXG4gICAgICAgICAgICBwcmVsb2FkOiB0cnVlLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICB2b2x1bWU6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJ1cm5TbmQgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgIHNyYzogWydhc3NldHMvYXVkaW8vZWZmZWN0cy9idXJuLm1wMyddLFxyXG4gICAgICAgICAgICBwcmVsb2FkOiB0cnVlLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaHVydFNuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL2h1cnQubXAzJ10sXHJcbiAgICAgICAgICAgIHByZWxvYWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY29pblNuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL2NvaW4ubXAzJ10sXHJcbiAgICAgICAgICAgIHByZWxvYWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZ2VtU25kID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICBzcmM6IFsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvZ2VtLm1wMyddLFxyXG4gICAgICAgICAgICBwcmVsb2FkOiB0cnVlLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICB2b2x1bWU6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnF1ZXN0SXRlbVNuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL3F1ZXN0LWl0ZW0ubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMud2luU25kID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICBzcmM6IFsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvd2luLm1wMyddLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICB2b2x1bWU6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmF0a01hZzEgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgIHNyYzogWydhc3NldHMvYXVkaW8vZWZmZWN0cy9hdGstbWFnMDEubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMSxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmhpdE1hZzEgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgIHNyYzogWydhc3NldHMvYXVkaW8vZWZmZWN0cy9oaXQtbWFnMDEubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuanVtcEF0ayA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL2p1bXAtYXRrMDEubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGFpbiA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOiBbJ2Fzc2V0cy9hdWRpby9lZmZlY3RzL3BhaW4wMS5tcDMnXSxcclxuICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuam1wQ29udGFjdCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgc3JjOlsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvam1wLWNvbnRhY3QubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLndvb3NoID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICBzcmM6IFsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvd29vc2gubXAzJ10sXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgICAgIHZvbHVtZTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3F1aXNoID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICBzcmM6IFsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvbW9iLXNxdWlzaC5tcDMnXSxcclxuICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZnhEZW1vU25kID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICBzcmM6IFsnYXNzZXRzL2F1ZGlvL2VmZmVjdHMvZngtZGVtby5tcDMnXSxcclxuICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgdm9sdW1lOiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcmV2aW91c011c2ljVm9sdW1lID0gMC42O1xyXG4gICAgcHJpdmF0ZSBwcmV2aW91c0Z4Vm9sdW1lID0gMTtcclxuXHJcbiAgICBwcml2YXRlIG11c2ljVm9sdW1lID0gMC42O1xyXG4gICAgcHJpdmF0ZSBmeFZvbHVtZSA9IDE7XHJcblxyXG4gICAgcHVibGljIGdldCBNdXNpY1ZvbHVtZSgpIHsgcmV0dXJuIHRoaXMubXVzaWNWb2x1bWU7IH1cclxuICAgIHB1YmxpYyBzZXQgTXVzaWNWb2x1bWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubXVzaWNWb2x1bWUgPSB2YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kU25kICYmIHRoaXMuYmFja2dyb3VuZFNuZC5wbGF5aW5nKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU25kLnZvbHVtZSh0aGlzLm11c2ljVm9sdW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBGeFZvbHVtZSgpIHsgcmV0dXJuIHRoaXMuZnhWb2x1bWU7IH1cclxuICAgIHB1YmxpYyBzZXQgRnhWb2x1bWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZnhWb2x1bWUgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIGdldCBJc0Z4T24oKSB7IHJldHVybiB0aGlzLmZ4Vm9sdW1lID4gMC4wOyB9XHJcbiAgICBwdWJsaWMgc2V0IElzRnhPbih2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0Z4Vm9sdW1lID0gdGhpcy5meFZvbHVtZTtcclxuICAgICAgICAgICAgdGhpcy5GeFZvbHVtZSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5GeFZvbHVtZSA9IHRoaXMucHJldmlvdXNGeFZvbHVtZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBJc011c2ljT24oKSB7IHJldHVybiB0aGlzLm11c2ljVm9sdW1lID4gMC4wOyB9XHJcbiAgICBwdWJsaWMgc2V0IElzTXVzaWNPbih2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c011c2ljVm9sdW1lID0gdGhpcy5tdXNpY1ZvbHVtZTtcclxuICAgICAgICAgICAgdGhpcy5NdXNpY1ZvbHVtZSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5NdXNpY1ZvbHVtZSA9IHRoaXMucHJldmlvdXNNdXNpY1ZvbHVtZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBDdXJyZW50VHJhY2tJZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VHJhY2s7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBnZXQgZnhEZW1vKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZ4RGVtb1NuZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMganVtcEF0dGFjaygpIHtcclxuICAgICAgICB0aGlzLndhbGtTbmQucGF1c2UoKTtcclxuICAgICAgICB0aGlzLmp1bXBBdGsubG9vcChmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5qdW1wQXRrLnBsYXkoKTtcclxuICAgICAgICB0aGlzLmp1bXBBdGsudm9sdW1lKHRoaXMuZnhWb2x1bWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBqdW1wKCkge1xyXG4gICAgICAgIHRoaXMud2Fsa1NuZC5wYXVzZSgpO1xyXG4gICAgICAgIHRoaXMuanVtcFNuZDEucGxheSgpO1xyXG4gICAgICAgIHRoaXMuanVtcFNuZDEudm9sdW1lKHRoaXMuZnhWb2x1bWUpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlkbGUoKSB7XHJcbiAgICAgICAgdGhpcy53YWxrU25kLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgd2Fsayhpc1J1bm5pbmc/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy53YWxrU25kLnJhdGUoaXNSdW5uaW5nID8gMi4wIDogMS4yKTtcclxuICAgICAgICBpZiAoIXRoaXMud2Fsa1NuZC5wbGF5aW5nKCkpIHtcclxuICAgICAgICAgICAgdGhpcy53YWxrU25kLnZvbHVtZSh0aGlzLmZ4Vm9sdW1lKTtcclxuICAgICAgICAgICAgdGhpcy53YWxrU25kLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgYXRrTWFnaWMxKCkge1xyXG4gICAgICAgIHRoaXMuYXRrTWFnMS52b2x1bWUodGhpcy5meFZvbHVtZSk7XHJcbiAgICAgICAgdGhpcy5hdGtNYWcxLnBsYXkoKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBoaXRNYWdpYzEoKSB7XHJcbiAgICAgICAgdGhpcy5oaXRNYWcxLnZvbHVtZSh0aGlzLmZ4Vm9sdW1lKTtcclxuICAgICAgICB0aGlzLmhpdE1hZzEucGxheSgpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGhpdFBhaW4oKSB7XHJcbiAgICAgICAgdGhpcy5wYWluLnZvbHVtZSh0aGlzLmZ4Vm9sdW1lKTtcclxuICAgICAgICB0aGlzLnBhaW4ucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtb2JTcXVpc2goKSB7XHJcbiAgICAgICAgdGhpcy5zcXVpc2gudm9sdW1lKHRoaXMuZnhWb2x1bWUpO1xyXG4gICAgICAgIHRoaXMuc3F1aXNoLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYnVsbGV0SGl0V2FsbCgpIHtcclxuICAgICAgICB0aGlzLndvb3NoLnZvbHVtZSh0aGlzLmZ4Vm9sdW1lKTtcclxuICAgICAgICB0aGlzLndvb3NoLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29pbigpIHtcclxuICAgICAgICB0aGlzLmNvaW5TbmQudm9sdW1lKHRoaXMuZnhWb2x1bWUpO1xyXG4gICAgICAgIHRoaXMuY29pblNuZC5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdlbSgpIHtcclxuICAgICAgICB0aGlzLmdlbVNuZC52b2x1bWUodGhpcy5meFZvbHVtZSk7XHJcbiAgICAgICAgdGhpcy5nZW1TbmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBodXJ0KCkge1xyXG4gICAgICAgIHRoaXMuaHVydFNuZC52b2x1bWUodGhpcy5meFZvbHVtZSk7XHJcbiAgICAgICAgdGhpcy5odXJ0U25kLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMganVtcENvbnRhY3QoKSB7XHJcbiAgICAgICAgdGhpcy5qbXBDb250YWN0LnZvbHVtZSh0aGlzLmZ4Vm9sdW1lKTtcclxuICAgICAgICB0aGlzLmptcENvbnRhY3QucGxheSgpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHF1ZXN0SXRlbSgpIHtcclxuICAgICAgICB0aGlzLnF1ZXN0SXRlbVNuZC52b2x1bWUodGhpcy5meFZvbHVtZSk7XHJcbiAgICAgICAgdGhpcy5xdWVzdEl0ZW1TbmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3aW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFja2dyb3VuZFNuZCAmJiB0aGlzLmJhY2tncm91bmRTbmQucGxheWluZygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZFNuZC5mYWRlKDEsIDAsIDUwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaHVydFNuZC5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy53YWxrU25kLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmp1bXBTbmQxLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmp1bXBTbmQyLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmJ1cm5TbmQuc3RvcCgpO1xyXG5cclxuICAgICAgICB0aGlzLndpblNuZC52b2x1bWUodGhpcy5meFZvbHVtZSk7XHJcbiAgICAgICAgdGhpcy53aW5TbmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBidXJuKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5idXJuU25kLnBsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1cm5TbmQudm9sdW1lKHRoaXMuZnhWb2x1bWUpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1cm5TbmQucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmh1cnQoKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBidXJuU3RvcCgpIHtcclxuICAgICAgICAvL3RoaXMuYnVyblNuZC5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5idXJuU25kLmZhZGUoMSwgMCwgMjAwKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuYnVyblNuZC5zdG9wKCksIDIwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFRyYWNrKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLm11c2ljVHJhY2tOYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tdXNpY1RyYWNrTmFtZXNbaV0uaW5kZXhPZihuYW1lKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0b3BUcmFjaygpIHtcclxuICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kU25kICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU25kLnN0b3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXlUcmFjayh0cmFja0lkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kU25kID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU25kID0gdGhpcy5tdXNpY1RyYWNrc1t0cmFja0lkXTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJwbGF5VHJhY2sgXCIgKyB0cmFja0lkLCB0aGlzLmJhY2tncm91bmRTbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYmFja2dyb3VuZFNuZCAhPT0gdGhpcy5tdXNpY1RyYWNrc1t0cmFja0lkXSkge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRTbmQuc3RvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRTbmQgPSB0aGlzLm11c2ljVHJhY2tzW3RyYWNrSWRdO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRTbmQudm9sdW1lKHRoaXMubXVzaWNWb2x1bWUpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRTbmQucGxheSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5iYWNrZ3JvdW5kU25kLnBsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kU25kLnZvbHVtZSh0aGlzLm11c2ljVm9sdW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZFNuZC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50VHJhY2sgPSB0cmFja0lkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIHNuZCA9IG5ldyBTb3VuZE1hbigpOyIsImltcG9ydCAqIGFzIHAyIGZyb20gXCJwMlwiO1xyXG5pbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuLic7XHJcbmltcG9ydCB7RGljdGlvbmFyeX0gZnJvbSAnLi4vX2VuZ2luZS9EaWN0aW9uYXJ5JztcclxuaW1wb3J0IHsgQ09MX0dSUF9HUk9VTkQsIENPTF9HUlBfU0NFTkUsIENPTF9HUlBfTlBDLCBDT0xfR1JQX1BMQVlFUiwgQ09MX0dSUF9CVUxMRVQgfSBmcm9tICcuL0NvbGxpc2lvbkdyb3Vwcyc7XHJcblxyXG4vKipcclxuICogVHVwbGUgb2YgdHdvIHBoeXNpY3MgYm9kaWVzIHRvdWNoaW5nIG9yIHBlbmV0cmF0aW5nIGVhY2ggb3RoZXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29udGFjdFBhaXIge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIEJvZHlBOiBwMi5Cb2R5LCBwdWJsaWMgQm9keUI6IHAyLkJvZHkpIHsgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFRha2VzIGNhcmUgb2YgdGhlIHBoeXNpY3Mgc2ltdWxhdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV29ybGRQMiB7XHJcblxyXG4gICAgcHVibGljIHBsYXllckJvZHk6IHAyLkJvZHk7XHJcbiAgICBwcml2YXRlIHdvcmxkOiBwMi5Xb3JsZDtcclxuICAgIHByaXZhdGUgZ3JvdW5kOiBwMi5Cb2R5O1xyXG4gICAgcHJpdmF0ZSBtYXRlcmlhbHM6IERpY3Rpb25hcnk8cDIuTWF0ZXJpYWw+O1xyXG4gICAgcHJpdmF0ZSBjb250YWN0UGFpcnM6IEFycmF5PENvbnRhY3RQYWlyPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBjb250YWN0V2F0Y2g6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdlIGhvbGQgYWxsIHBsYXllciBjb250YWN0cyBzZXBhcmF0ZSAoZHVlIHRvIGhlYXZ5IHVzYWdlKS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBwbGF5ZXJCb2R5Q29udGFjdHM6IEFycmF5PHAyLkJvZHk+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBmaXhlZFRpbWVTdGVwID0gMSAvIDYwOyAvLyBzZWNvbmRzXHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMud29ybGQgPSBuZXcgcDIuV29ybGQoe1xyXG4gICAgICAgICAgICBncmF2aXR5OiBbMCwgLTE1NTBdLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNldHVwTWF0ZXJpYWxzKCk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gY3JlYXRlIGFuIGluZmluaXRlIGdyb3VuZCBwbGFuZSBib2R5XHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB0aGlzLmdyb3VuZCA9IG5ldyBwMi5Cb2R5KHtcclxuICAgICAgICAgICAgbWFzczogMCxcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2hhcGUgPSBuZXcgcDIuUGxhbmUoKTtcclxuICAgICAgICBzaGFwZS5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWxzLmdldChcImdyb3VuZF9kZWZhdWx0XCIpO1xyXG4gICAgICAgIHNoYXBlLmNvbGxpc2lvbkdyb3VwID0gQ09MX0dSUF9HUk9VTkQ7XHJcbiAgICAgICAgc2hhcGUuY29sbGlzaW9uTWFzayA9IENPTF9HUlBfU0NFTkUgfCBDT0xfR1JQX05QQyB8IENPTF9HUlBfUExBWUVSIHwgQ09MX0dSUF9CVUxMRVQ7XHJcbiAgICAgICAgdGhpcy5ncm91bmQuYWRkU2hhcGUoc2hhcGUpO1xyXG4gICAgICAgIHRoaXMud29ybGQuYWRkQm9keSh0aGlzLmdyb3VuZCk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIHBsYXllciBib2R5XHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB0aGlzLnBsYXllckJvZHkgPSBuZXcgcDIuQm9keSh7XHJcbiAgICAgICAgICAgIG1hc3M6IDQyLFxyXG4gICAgICAgICAgICBmaXhlZFJvdGF0aW9uOiB0cnVlLCAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucGxheWVyQm9keS5kYW1waW5nID0gMC4wMDE7XHJcbiAgICAgICAgc2hhcGUgPSBuZXcgcDIuQ2lyY2xlKHtcclxuICAgICAgICAgICAgcmFkaXVzOiAyNCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBzaGFwZS5jb2xsaXNpb25Hcm91cCA9IENPTF9HUlBfUExBWUVSO1xyXG4gICAgICAgIHNoYXBlLmNvbGxpc2lvbk1hc2sgPSBDT0xfR1JQX0dST1VORCB8IENPTF9HUlBfU0NFTkUgfCBDT0xfR1JQX05QQyB8IENPTF9HUlBfQlVMTEVUO1xyXG4gICAgICAgIHNoYXBlLm1hdGVyaWFsID0gdGhpcy5tYXRlcmlhbHMuZ2V0KFwicGxheWVyXCIpO1xyXG4gICAgICAgIHRoaXMucGxheWVyQm9keS5hZGRTaGFwZShzaGFwZSk7XHJcbiAgICAgICAgdGhpcy53b3JsZC5hZGRCb2R5KHRoaXMucGxheWVyQm9keSk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgLy8gIHNldHRpbmdzXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB0aGlzLndvcmxkLnNsZWVwTW9kZSA9IHAyLldvcmxkLkJPRFlfU0xFRVBJTkc7XHJcbiAgICAgICAgdGhpcy53b3JsZC5vbihcImJlZ2luQ29udGFjdFwiLCB0aGlzLmJlZ2luQ29udGFjdCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy53b3JsZC5vbihcImVuZENvbnRhY3RcIiwgdGhpcy5lbmRDb250YWN0LCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIGJvZGllcyBleGNlcHQgdGhlIHBsYXllciBib2R5IGFuZCBncm91bmQgcGxhbmUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGVhckxldmVsKCkge1xyXG4gICAgICAgIHZhciBib2RpZXMgPSB0aGlzLndvcmxkLmJvZGllcztcclxuICAgICAgICBmb3IgKHZhciBpID0gYm9kaWVzLmxlbmd0aC0xOyBpID49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBiID0gYm9kaWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoYiAhPT0gdGhpcy5wbGF5ZXJCb2R5ICYmIGIgIT09IHRoaXMuZ3JvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkLnJlbW92ZUJvZHkoYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd29ybGQgYm9kaWVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGJvZGllcygpOiBBcnJheTxwMi5Cb2R5PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud29ybGQuYm9kaWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBldmVudCBoYW5kbGVyIHRvIHRoZSBwMiB3b3JsZCBvYmplY3QuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb24oZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IGFueSwgY29udGV4dD86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XHJcbiAgICAgICAgdGhpcy53b3JsZC5vbihldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWR2YW5jZXMgdGhlIHBoeXNpY3Mgc2ltdWxhdGlvbiBmb3IgdGhlIGdpdmVuIGR0IHRpbWVcclxuICAgICAqIEBwYXJhbSBkdCB0aGUgdGltZSBpbiBzZWNvbmRzIHNpbmNlIHRoZSBsYXN0IHNpbXVsYXRpb24gc3RlcFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdXBkYXRlKGR0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLndvcmxkLnN0ZXAodGhpcy5maXhlZFRpbWVTdGVwLCBkdC8xMDAwKTtcclxuICAgICAgICBHbG9iYWwucG9zaXRpb24ueCA9IHRoaXMucGxheWVyQm9keS5pbnRlcnBvbGF0ZWRQb3NpdGlvblswXTtcclxuICAgICAgICBHbG9iYWwucG9zaXRpb24ueSA9IHRoaXMucGxheWVyQm9keS5pbnRlcnBvbGF0ZWRQb3NpdGlvblsxXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIGJvZHkgZnJvbSB3b3JsZC5cclxuICAgICAqIEBwYXJhbSBib2R5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVCb2R5KGJvZHk6IHAyLkJvZHkpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLndvcmxkLnJlbW92ZUJvZHkoYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRzIGFuIG9iamVjdCB0byB0aGUgcDIgd29ybGRcclxuICAgICAqIEBwYXJhbSBib2R5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRCb2R5KGJvZHk6IHAyLkJvZHkpOiB2b2lkIHtcclxuICAgICAgICAvLyBIQUNLOiBsb2FkZXIgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gc3RvcmVzIHRoZSBtYXRlcmlhbCBuYW1lIGluIHNoYXBlLm1hdGVyaWFsTmFtZVxyXG4gICAgICAgIGlmIChib2R5LnNoYXBlcyAmJiBib2R5LnNoYXBlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBib2R5LnNoYXBlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNoYXBlOiBhbnkgPSBib2R5LnNoYXBlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChzaGFwZS5tYXRlcmlhbE5hbWUgJiYgIXNoYXBlLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hhcGUubWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFscy5nZXQoc2hhcGUubWF0ZXJpYWxOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndvcmxkLmFkZEJvZHkoYm9keSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgYWxsIHNhdmVkIGNvbnRhY3RzIChmcm9tIGNvbnRhY3RQYWlycykgZm9yIHRoZSBnaXZlbiBib2R5LlxyXG4gICAgICogQHBhcmFtIGJvZHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNsZWFyQ29udGFjdHNGb3JCb2R5KGJvZHk6IHAyLkJvZHkpOnZvaWQge1xyXG4gICAgICAgIGlmIChib2R5ID09PSB0aGlzLnBsYXllckJvZHkpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJCb2R5Q29udGFjdHMgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGZvdW5kSWR4OiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHdoaWxlIChmb3VuZElkeCA+IC0xKSB7XHJcbiAgICAgICAgICAgIGZvdW5kSWR4ID0gLTE7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250YWN0UGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjcDpDb250YWN0UGFpciA9IHRoaXMuY29udGFjdFBhaXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNwLkJvZHlBID09PSBib2R5IHx8IGNwLkJvZHlCID09PSBib2R5KSAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kSWR4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZvdW5kSWR4ID49IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFjdFBhaXJzLnNwbGljZShmb3VuZElkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXR1cm5zIGFsbCBjb250YWN0IHBhaXJzIGZvciB0aGUgZ2l2ZW4gYm9keS5cclxuICAgICAqIE5vdGU6IHRoZSBib2R5IG11c3QgYmUgaW4gdGhlIGNvbnRhY3Qgd2F0Y2ggbGlzdCBvciBhbiBlbXB0eSBhcnJheSB3aWxsIGJlIHJldHVybmVkLlxyXG4gICAgICogQHBhcmFtIGJvZHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbnRhY3RzRm9yQm9keShib2R5OiBwMi5Cb2R5KTogQXJyYXk8Q29udGFjdFBhaXI+IHtcclxuICAgICAgICB2YXIgZm91bmRQYWlyczogQXJyYXk8Q29udGFjdFBhaXI+ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuY29udGFjdFBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjcDogQ29udGFjdFBhaXIgPSB0aGlzLmNvbnRhY3RQYWlyc1tpXTsgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY3AuQm9keUEgPT09IGJvZHkgfHwgY3AuQm9keUIgPT09IGJvZHkpIHtcclxuICAgICAgICAgICAgICAgIGZvdW5kUGFpcnMucHVzaChjcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBmb3VuZFBhaXJzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgYm9keSB0byB0aGUgY29udGFjdCB3YXRjaCBsaXN0LlxyXG4gICAgICogT25seSBib2RpZXMgaW4gdGhpcyBsaXN0IGNhbiBiZSByZXRyaWV2ZWQgdmlhIHRoZSBnZXRDb250YWN0c0ZvckJvZHkoKSBmdW5jdGlvbi5cclxuICAgICAqIEBwYXJhbSBib2R5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDb250YWN0V2F0Y2goYm9keTogcDIuQm9keSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY29udGFjdFdhdGNoLnB1c2goYm9keS5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFsbCBib2RpZXMgdGhlIHBsYXllciBoYXMgY29udGFjdCB3aXRoLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHBsYXllckNvbnRhY3RzKCk6IHAyLkJvZHlbXXtcclxuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJCb2R5Q29udGFjdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBiZWdpbkNvbnRhY3QgPSAoZXZ0OiBhbnkpID0+IHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgYnVsbGV0OiBwMi5Cb2R5ID0gbnVsbDtcclxuICAgICAgICBsZXQgb3RoZXI6IHAyLkJvZHkgPSBudWxsO1xyXG4gICAgICAgIGlmIChldnQuYm9keUEuc2hhcGVzWzBdLmNvbGxpc2lvbkdyb3VwID09PSBDT0xfR1JQX0JVTExFVCkge1xyXG4gICAgICAgICAgICBidWxsZXQgPSBldnQuYm9keUE7XHJcbiAgICAgICAgICAgIG90aGVyID0gZXZ0LmJvZHlCO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXZ0LmJvZHlCLnNoYXBlc1swXS5jb2xsaXNpb25Hcm91cCA9PT0gQ09MX0dSUF9CVUxMRVQpe1xyXG4gICAgICAgICAgICBidWxsZXQgPSBldnQuYm9keUI7XHJcbiAgICAgICAgICAgIG90aGVyID0gZXZ0LmJvZHlBO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnVsbGV0KSB7XHJcbiAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJlbWl0dGluZyBidWxldHRDb250YWN0LCBib2R5LmlkOiBcIiArIGJ1bGxldC5pZCk7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGQuZW1pdCh7IHR5cGU6IFwiYnVsbGV0Q29udGFjdFwiLCBwbGF5ZXJIaXQ6IG90aGVyID09PSB0aGlzLnBsYXllckJvZHksIGJ1bGxldEJvZHk6IGJ1bGxldCwgb3RoZXJCb2R5OiBvdGhlciB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gIGNoZWNrIGZvciBwbGF5ZXIgY29udGFjdHMgKGJ1dCBvbmx5IHdpdGggZHluYW1pYyBib2RpZXMpXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyQm9keSA9PT0gZXZ0LmJvZHlBKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQm9keUNvbnRhY3RzLnB1c2goZXZ0LmJvZHlCKTtcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5lbWl0KHsgdHlwZTogXCJwbGF5ZXJDb250YWN0XCIsIHZlbG9jaXR5OiB0aGlzLnBsYXllckJvZHkudmVsb2NpdHksIGJvZHk6IGV2dC5ib2R5QiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wbGF5ZXJCb2R5ID09PSBldnQuYm9keUIpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJCb2R5Q29udGFjdHMucHVzaChldnQuYm9keUEpO1xyXG4gICAgICAgICAgICB0aGlzLndvcmxkLmVtaXQoeyB0eXBlOiBcInBsYXllckNvbnRhY3RcIiwgdmVsb2NpdHk6IHRoaXMucGxheWVyQm9keS52ZWxvY2l0eSwgYm9keTogZXZ0LmJvZHlBIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgY2hlY2sgZm9yIHdhdGNoZWQgYm9kaWVzIGFuZCBzdG9yZSBwYWlycyBpZiBtYXRjaFxyXG4gICAgICAgIHZhciB3YXRjaGVkSXRlbUZvdW5kID0gdGhpcy5jb250YWN0V2F0Y2guZmlsdGVyKChib2R5SWQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChib2R5SWQgPT09IGV2dC5ib2R5QS5pZCB8fCBib2R5SWQgPT09IGV2dC5ib2R5Qi5pZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHdhdGNoZWRJdGVtRm91bmQgJiYgd2F0Y2hlZEl0ZW1Gb3VuZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBjcDogQ29udGFjdFBhaXIgPSBuZXcgQ29udGFjdFBhaXIoZXZ0LmJvZHlBLCBldnQuYm9keUIpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhY3RQYWlycy5wdXNoKGNwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgZW5kQ29udGFjdCA9IChldnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIC8vICBubyBuZWVkIHRvIHVwZGF0ZSBwbGF5ZXIgY29udGFjdHMgb3IgY29udGFjdCBwYWlycyBmb3IgYnVsbGV0c1xyXG4gICAgICAgIGxldCBpc0J1bGxldENvbm50YWN0ID0gZXZ0LmJvZHlBLnNoYXBlc1swXS5jb2xsaXNpb25Hcm91cCA9PT0gQ09MX0dSUF9CVUxMRVQgfHwgZXZ0LmJvZHlCLnNoYXBlc1swXS5jb2xsaXNpb25Hcm91cCA9PT0gQ09MX0dSUF9CVUxMRVQ7XHJcbiAgICAgICAgaWYgKGlzQnVsbGV0Q29ubnRhY3QpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gIGlmIGl0IGlzIGEgcGxheWVyIGNvbnRhY3QgcmVtb3ZlIHRoZSBmb3JlaWduIGJvZHkgZnJvbSB0aGUgcGxheWVyQm9keUNvbnRhY3RzIGxpc3RcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJCb2R5ID09PSBldnQuYm9keUEgKSB7XHJcbiAgICAgICAgICAgIHZhciBib2R5SURYID0gdGhpcy5wbGF5ZXJCb2R5Q29udGFjdHMuaW5kZXhPZihldnQuYm9keUIpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckJvZHlDb250YWN0cy5zcGxpY2UoYm9keUlEWCwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGQuZW1pdCh7IHR5cGU6IFwicGxheWVyQ29udGFjdEVuZFwiLCB2ZWxvY2l0eTogdGhpcy5wbGF5ZXJCb2R5LnZlbG9jaXR5LCBib2R5OiBldnQuYm9keUIgfSk7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJlbmRDb250YWN0XCIsZXZ0LmJvZHlCKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wbGF5ZXJCb2R5ID09PSBldnQuYm9keUIpIHtcclxuICAgICAgICAgICAgdmFyIGJvZHlJRFggPSB0aGlzLnBsYXllckJvZHlDb250YWN0cy5pbmRleE9mKGV2dC5ib2R5Qik7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQm9keUNvbnRhY3RzLnNwbGljZShib2R5SURYLCAxKTtcclxuICAgICAgICAgICAgdGhpcy53b3JsZC5lbWl0KHsgdHlwZTogXCJwbGF5ZXJDb250YWN0RW5kXCIsIHZlbG9jaXR5OiB0aGlzLnBsYXllckJvZHkudmVsb2NpdHksIGJvZHk6IGV2dC5ib2R5QSB9KTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImVuZENvbnRhY3RcIiwgZXZ0LmJvZHlBKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJlbmRDb250YWN0OiBcIiwgZXZ0KTtcclxuICAgICAgICB2YXIgZm91bmRJZHg6IG51bWJlciA9IC0xO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250YWN0UGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNwOiBDb250YWN0UGFpciA9IHRoaXMuY29udGFjdFBhaXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAoY3AuQm9keUEgPT09IGV2dC5ib2R5QSAmJiBjcC5Cb2R5QiA9PT0gZXZ0LmJvZHlCKSB8fFxyXG4gICAgICAgICAgICAgICAgKGNwLkJvZHlBID09PSBldnQuYm9keUIgJiYgY3AuQm9keUIgPT09IGV2dC5ib2R5QSkpIHtcclxuICAgICAgICAgICAgICAgIGZvdW5kSWR4ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZm91bmRJZHggPj0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhY3RQYWlycy5zcGxpY2UoZm91bmRJZHgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cE1hdGVyaWFscygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1hdGVyaWFscyA9IG5ldyBEaWN0aW9uYXJ5PHAyLk1hdGVyaWFsPigpO1xyXG4gICAgICAgIHRoaXMubWF0ZXJpYWxzLnNldChcInBsYXllclwiLCBuZXcgcDIuTWF0ZXJpYWwocDIuTWF0ZXJpYWwuaWRDb3VudGVyKyspKTtcclxuICAgICAgICB0aGlzLm1hdGVyaWFscy5zZXQoXCJncm91bmRfZGVmYXVsdFwiLCBuZXcgcDIuTWF0ZXJpYWwocDIuTWF0ZXJpYWwuaWRDb3VudGVyKyspKTtcclxuICAgICAgICB0aGlzLm1hdGVyaWFscy5zZXQoXCJib3hfZGVmYXVsdFwiLCBuZXcgcDIuTWF0ZXJpYWwocDIuTWF0ZXJpYWwuaWRDb3VudGVyKyspKTtcclxuICAgICAgICB0aGlzLm1hdGVyaWFscy5zZXQoXCJib3hfaGlnaGZyaWN0aW9uXCIsIG5ldyBwMi5NYXRlcmlhbChwMi5NYXRlcmlhbC5pZENvdW50ZXIrKykpO1xyXG4gICAgICAgIHRoaXMubWF0ZXJpYWxzLnNldChcIm1vYl9kZWZhdWx0XCIsIG5ldyBwMi5NYXRlcmlhbChwMi5NYXRlcmlhbC5pZENvdW50ZXIrKykpO1xyXG4gICAgICAgIHRoaXMubWF0ZXJpYWxzLnNldChcImJ1bXBlclwiLCBuZXcgcDIuTWF0ZXJpYWwocDIuTWF0ZXJpYWwuaWRDb3VudGVyKyspKTtcclxuXHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXJHcm91bmRDb250YWN0TWF0ZXJpYWwgPSBuZXcgcDIuQ29udGFjdE1hdGVyaWFsKFxyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFscy5nZXQoXCJwbGF5ZXJcIiksXHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxzLmdldChcImdyb3VuZF9kZWZhdWx0XCIpLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMC44NSxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjEsXHJcbiAgICAgICAgICAgICAgICBzdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgcmVsYXhhdGlvbjogcDIuRXF1YXRpb24uREVGQVVMVF9SRUxBWEFUSU9OLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25TdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25SZWxheGF0aW9uOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1JFTEFYQVRJT04sXHJcbiAgICAgICAgICAgICAgICBzdXJmYWNlVmVsb2NpdHk6MFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLndvcmxkLmFkZENvbnRhY3RNYXRlcmlhbChwbGF5ZXJHcm91bmRDb250YWN0TWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICB2YXIgcGxheWVyTW9iQ29udGFjdE1hdGVyaWFsID0gbmV3IHAyLkNvbnRhY3RNYXRlcmlhbChcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbHMuZ2V0KFwicGxheWVyXCIpLFxyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFscy5nZXQoXCJtb2JfZGVmYXVsdFwiKSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IDAuMixcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjQsXHJcbiAgICAgICAgICAgICAgICBzdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgcmVsYXhhdGlvbjogcDIuRXF1YXRpb24uREVGQVVMVF9SRUxBWEFUSU9OLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25TdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25SZWxheGF0aW9uOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1JFTEFYQVRJT04sXHJcbiAgICAgICAgICAgICAgICBzdXJmYWNlVmVsb2NpdHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy53b3JsZC5hZGRDb250YWN0TWF0ZXJpYWwocGxheWVyTW9iQ29udGFjdE1hdGVyaWFsKTtcclxuXHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXJCb3hDb250YWN0TWF0ZXJpYWwgPSBuZXcgcDIuQ29udGFjdE1hdGVyaWFsKFxyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFscy5nZXQoXCJwbGF5ZXJcIiksXHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxzLmdldChcImJveF9kZWZhdWx0XCIpLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMC41MCxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgc3RpZmZuZXNzOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1NUSUZGTkVTUyxcclxuICAgICAgICAgICAgICAgIHJlbGF4YXRpb246IHAyLkVxdWF0aW9uLkRFRkFVTFRfUkVMQVhBVElPTixcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uU3RpZmZuZXNzOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1NUSUZGTkVTUyxcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uUmVsYXhhdGlvbjogcDIuRXF1YXRpb24uREVGQVVMVF9SRUxBWEFUSU9OLFxyXG4gICAgICAgICAgICAgICAgc3VyZmFjZVZlbG9jaXR5OiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMud29ybGQuYWRkQ29udGFjdE1hdGVyaWFsKHBsYXllckJveENvbnRhY3RNYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXJCb3hIaWdoRmlyY3RDb250YWN0TWF0ZXJpYWwgPSBuZXcgcDIuQ29udGFjdE1hdGVyaWFsKFxyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFscy5nZXQoXCJwbGF5ZXJcIiksXHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxzLmdldChcImJveF9oaWdoZnJpY3Rpb25cIiksXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZyaWN0aW9uOiAwLjcwLFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMjAsXHJcbiAgICAgICAgICAgICAgICBzdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgcmVsYXhhdGlvbjogcDIuRXF1YXRpb24uREVGQVVMVF9SRUxBWEFUSU9OLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25TdGlmZm5lc3M6IHAyLkVxdWF0aW9uLkRFRkFVTFRfU1RJRkZORVNTLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25SZWxheGF0aW9uOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1JFTEFYQVRJT04sXHJcbiAgICAgICAgICAgICAgICBzdXJmYWNlVmVsb2NpdHk6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy53b3JsZC5hZGRDb250YWN0TWF0ZXJpYWwocGxheWVyQm94SGlnaEZpcmN0Q29udGFjdE1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgdmFyIHBsYXllckJ1bXBlckNvbnRhY3RNYXRlcmlhbCA9IG5ldyBwMi5Db250YWN0TWF0ZXJpYWwoXHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxzLmdldChcInBsYXllclwiKSxcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbHMuZ2V0KFwiYnVtcGVyXCIpLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMC4zNSxcclxuICAgICAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAwLjg1LFxyXG4gICAgICAgICAgICAgICAgc3RpZmZuZXNzOiBOdW1iZXIuTUFYX1ZBTFVFLFxyXG4gICAgICAgICAgICAgICAgcmVsYXhhdGlvbjogcDIuRXF1YXRpb24uREVGQVVMVF9SRUxBWEFUSU9OLFxyXG4gICAgICAgICAgICAgICAgZnJpY3Rpb25TdGlmZm5lc3M6IE51bWJlci5NQVhfVkFMVUUsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvblJlbGF4YXRpb246IHAyLkVxdWF0aW9uLkRFRkFVTFRfUkVMQVhBVElPTixcclxuICAgICAgICAgICAgICAgIHN1cmZhY2VWZWxvY2l0eTogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLndvcmxkLmFkZENvbnRhY3RNYXRlcmlhbChwbGF5ZXJCdW1wZXJDb250YWN0TWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICB2YXIgYm94R3JvdW5kQ29udGFjdE1hdGVyaWFsID0gbmV3IHAyLkNvbnRhY3RNYXRlcmlhbChcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbHMuZ2V0KFwiYm94X2RlZmF1bHRcIiksXHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxzLmdldChcImdyb3VuZF9kZWZhdWx0XCIpLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMC44LFxyXG4gICAgICAgICAgICAgICAgcmVzdGl0dXRpb246IDAuMyxcclxuICAgICAgICAgICAgICAgIHN0aWZmbmVzczogcDIuRXF1YXRpb24uREVGQVVMVF9TVElGRk5FU1MsXHJcbiAgICAgICAgICAgICAgICByZWxheGF0aW9uOiBwMi5FcXVhdGlvbi5ERUZBVUxUX1JFTEFYQVRJT04sXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvblN0aWZmbmVzczogcDIuRXF1YXRpb24uREVGQVVMVF9TVElGRk5FU1MsXHJcbiAgICAgICAgICAgICAgICBmcmljdGlvblJlbGF4YXRpb246IHAyLkVxdWF0aW9uLkRFRkFVTFRfUkVMQVhBVElPTixcclxuICAgICAgICAgICAgICAgIHN1cmZhY2VWZWxvY2l0eTogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLndvcmxkLmFkZENvbnRhY3RNYXRlcmlhbChib3hHcm91bmRDb250YWN0TWF0ZXJpYWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIHdwMiA9IG5ldyBXb3JsZFAyKCk7Il0sInNvdXJjZVJvb3QiOiIifQ==