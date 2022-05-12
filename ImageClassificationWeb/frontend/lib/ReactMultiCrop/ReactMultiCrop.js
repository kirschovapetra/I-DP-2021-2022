var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { Component } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { CustomFabricRect } from "@berviantoleo/react-multi-crop";
import { KEY_VALUES } from "rsuite/utils";
var ReactMultiCrop = /** @class */ (function (_super) {
    __extends(ReactMultiCrop, _super);
    function ReactMultiCrop(props) {
        var _this = _super.call(this, props) || this;
        _this.multiSelect = false;
        _this.multiSelectItems = [];
        _this.REGEXP_ORIGINS = /^(\w+:)\/\/([^:/?#]*):?(\d*)/i;
        _this.divRef = React.createRef();
        // added
        _this.resizeCanvas = function () {
            var canvas = _this.state.canvas;
            var height = _this.props.height;
            var outerCanvasContainer = _this.divRef.current;
            if (outerCanvasContainer && canvas && height) {
                var ratio = canvas.getWidth() / canvas.getHeight();
                var containerWidth = outerCanvasContainer.clientWidth;
                var containerHeightRatio = containerWidth / ratio;
                var containerHeight = containerHeightRatio > height ? height
                    : containerHeightRatio < height / 2 ? height
                        : containerHeightRatio;
                canvas.setDimensions({ width: containerWidth, height: containerHeight });
            }
        };
        _this.updateActive = function (canvas, prevProps, activeObject, activeObjects) {
            // prev active object
            var prevActive = prevProps.activeObject;
            if (prevActive !== activeObject && activeObject) {
                var dataObjects = canvas.getObjects();
                var allSelected = dataObjects.filter(function (obj) { return obj.objectId === activeObject; });
                canvas.discardActiveObject();
                for (var _i = 0, allSelected_1 = allSelected; _i < allSelected_1.length; _i++) {
                    var objectSelect = allSelected_1[_i];
                    canvas.setActiveObject(objectSelect);
                }
                canvas.requestRenderAll();
            }
            // prev active objects (list)// added
            var prevActiveList = prevProps.activeObjects;
            if (activeObjects && !_this.arrayEquals(prevActiveList, activeObjects)) {
                var dataObjects = canvas.getObjects();
                var allSelected = dataObjects.filter(function (obj) { return activeObjects.includes(obj.objectId); });
                _this.setActiveSelection(canvas, allSelected);
            }
            if (_this.multiSelect) {
                var prevMultiSelectItems = __spreadArray([], _this.multiSelectItems, true);
                var currentMultiSelectItems = _this.addToMultiselect(canvas.getActiveObjects());
                _this.multiSelectItems = currentMultiSelectItems;
                if (!_this.arrayEquals(prevMultiSelectItems, currentMultiSelectItems)) {
                    _this.setActiveSelection(canvas, currentMultiSelectItems);
                }
            }
        };
        _this.updateZoom = function (canvas, prevProps, zoomLevel) {
            var prevZoomLevel = prevProps.zoomLevel;
            if (prevZoomLevel !== zoomLevel && zoomLevel && zoomLevel > 0) {
                var centerPoint = new fabric.Point(canvas.getCenter().left, canvas.getCenter().top);
                canvas.zoomToPoint(centerPoint, zoomLevel);
                canvas.renderAll();
            }
        };
        // added
        _this.updateColors = function (canvas, prevProps, colorMap) {
            var prevColorMap = prevProps.colorMap;
            if (colorMap && prevColorMap != colorMap) {
                canvas.getObjects("rect").forEach(function (obj) {
                    var objectId = obj.objectId;
                    var color = colorMap.get(objectId);
                    if (color)
                        obj.set("fill", color);
                });
                canvas.requestRenderAll();
            }
        };
        // added
        _this.updateTexts = function (canvas, prevProps, resultMap) {
            var prevResultMap = prevProps.resultMap;
            if (resultMap && prevResultMap != resultMap) {
                canvas.getObjects("rect").forEach(function (obj) {
                    var objectId = obj.objectId;
                    var result = resultMap.get(objectId);
                    var textObj = canvas.getObjects().filter(function (itm) { return itm.cacheProperties && itm.cacheProperties.includes(objectId); })[0];
                    if (result !== undefined) {
                        textObj.text = '  ' + result + '  ';
                        textObj.visible = true;
                    }
                    else {
                        textObj.text = '';
                        textObj.visible = false;
                    }
                });
                canvas.requestRenderAll();
            }
        };
        // added
        _this.updateBgImage = function (canvas, prevProps) {
            var image = _this.props.image;
            var prevImage = prevProps.image;
            if (image && prevImage !== image) {
                _this.clearCanvas();
                _this.initialImage();
                canvas.requestRenderAll();
            }
        };
        _this.state = {
            canvas: null,
            initial: true,
        };
        _this.color = props.cropBackgroundColor || 'yellow';
        _this.opacity = props.cropBackgroundOpacity || 0.5;
        _this.keyboardHandler = _this.keyboardHandler.bind(_this);
        _this.addNew = _this.addNew.bind(_this);
        _this.deleteActiveShapes = _this.deleteActiveShapes.bind(_this);
        _this.discardActiveObjects = _this.discardActiveObjects.bind(_this);
        return _this;
    }
    ReactMultiCrop.prototype.componentDidMount = function () {
        var canvas = this.state.canvas;
        if (!canvas) {
            this.initialCanvas();
        }
        window.addEventListener('resize', this.resizeCanvas);
    };
    ReactMultiCrop.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.resizeCanvas);
    };
    // added
    ReactMultiCrop.prototype.arrayEquals = function (a, b) {
        return Array.isArray(a)
            && Array.isArray(b)
            && a.length === b.length
            && a.every(function (val, index) { return val === b[index]; });
    };
    ReactMultiCrop.prototype.componentDidUpdate = function (prevProps) {
        var canvas = this.state.canvas;
        if (canvas) {
            var _a = this.props, zoomLevel = _a.zoomLevel, activeObject = _a.activeObject, activeObjects = _a.activeObjects, colorMap = _a.colorMap, resultMap = _a.resultMap;
            this.updateZoom(canvas, prevProps, zoomLevel);
            this.updateBgImage(canvas, prevProps);
            this.updateColors(canvas, prevProps, colorMap);
            this.updateTexts(canvas, prevProps, resultMap);
            this.updateActive(canvas, prevProps, activeObject, activeObjects);
        }
    };
    ReactMultiCrop.prototype.setActiveSelection = function (canvas, items) {
        var options = {
            canvas: canvas,
            borderColor: this.props.borderColor,
            cornerColor: this.props.cornerColor,
            cornerSize: this.props.cornerSize,
            transparentCorners: this.props.transparentCorners,
        };
        canvas.discardActiveObject();
        var selection = new fabric.ActiveSelection(items, options);
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
    };
    ReactMultiCrop.prototype.loadImage = function (img) {
        var _a = this.state, initial = _a.initial, canvas = _a.canvas;
        if (!canvas) {
            return;
        }
        if (!canvas.width || !canvas.height || !img.height || !img.width) {
            return;
        }
        var zoomLevel = this.props.zoomLevel;
        // detect ratio
        var ratio = img.height / img.width;
        var newHeight = canvas.width * ratio;
        canvas.setHeight(newHeight);
        // added
        var centerPoint = new fabric.Point(canvas.getCenter().left, canvas.getCenter().top);
        if (zoomLevel) {
            canvas.zoomToPoint(centerPoint, zoomLevel);
        }
        else {
            canvas.zoomToPoint(centerPoint, canvas.width / img.width);
        }
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        if (initial) {
            this.setState({ initial: false }, this.initialObjects.bind(this));
        }
    };
    ReactMultiCrop.prototype.isCrossOriginURL = function (url) {
        var parts = url.match(this.REGEXP_ORIGINS);
        return (parts !== null &&
            (parts[1] !== window.location.protocol ||
                parts[2] !== window.location.hostname ||
                parts[3] !== window.location.port));
    };
    ReactMultiCrop.prototype.initialImage = function () {
        var image = this.props.image;
        var loadImageNow = this.loadImage.bind(this);
        if (image) {
            var isCrossOrigin = this.isCrossOriginURL(image);
            var options = {};
            if (isCrossOrigin) {
                options.crossOrigin = null;
            }
            fabric.Image.fromURL(image, loadImageNow, options);
        }
    };
    ReactMultiCrop.prototype.initialObjects = function () {
        var canvas = this.state.canvas;
        if (!canvas) {
            return;
        }
        var _a = this.props, record = _a.record, readonly = _a.readonly, borderColor = _a.borderColor, cornerColor = _a.cornerColor, cornerSize = _a.cornerSize, transparentCorners = _a.transparentCorners;
        if (record) {
            var inputObject = record.clippings;
            if (Array.isArray(inputObject) &&
                inputObject.length > 0 &&
                typeof inputObject[0] === 'object') {
                var attribute = {
                    borderColor: borderColor,
                    cornerColor: cornerColor,
                    cornerSize: cornerSize,
                    transparentCorners: transparentCorners,
                };
                var totalRendered = 0;
                for (var _i = 0, inputObject_1 = inputObject; _i < inputObject_1.length; _i++) {
                    var coord = inputObject_1[_i];
                    var rect = this.createObject(canvas, coord, attribute, readonly || false);
                    if (rect) {
                        canvas.add(rect);
                        totalRendered += 1;
                    }
                }
                if (totalRendered > 0) {
                    // canvas.renderAll();
                    this.setOutput();
                }
            }
        }
        else {
            console.log('Not have any record. Skipped.');
        }
    };
    ReactMultiCrop.prototype.zoom = function (options) {
        var image = this.props.image;
        if (image === '' || image === null || image === undefined || (image === null || image === void 0 ? void 0 : image.toString().length) === 0)
            return;
        if (!options.e.shiftKey)
            return;
        var canvas = this.state.canvas;
        if (!canvas)
            return;
        var delta = options.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= Math.pow(0.999, delta);
        if (zoom > 20)
            zoom = 20;
        if (zoom < 0.01)
            zoom = 0.01;
        // added
        canvas.zoomToPoint(new fabric.Point(canvas.getCenter().left, canvas.getCenter().top), zoom);
        options.e.preventDefault();
        options.e.stopPropagation();
        var zoomChanged = this.props.zoomChanged;
        if (zoomChanged)
            zoomChanged(zoom);
    };
    ReactMultiCrop.prototype.mouseHover = function (options) {
        var onHover = this.props.onHover;
        var converter = this.shapetoStructureData.bind(this);
        var target = options.target;
        if (target && target.type === 'rect' && onHover) {
            var data = converter(target);
            onHover(data);
        }
    };
    ReactMultiCrop.prototype.mouseOut = function (options) {
        var onHover = this.props.onHover;
        var target = options.target;
        if (target && target.type === 'rect' && onHover) {
            onHover(null);
        }
    };
    // added
    ReactMultiCrop.prototype.addToMultiselect = function (fromList) {
        var currentMultiSelect = __spreadArray([], this.multiSelectItems, true);
        var toListIds = this.multiSelectItems.map(function (itm) {
            return itm.objectId;
        });
        fromList.forEach(function (itm) {
            if (!toListIds.includes(itm.objectId)) {
                currentMultiSelect.push(itm);
            }
        });
        return currentMultiSelect;
    };
    ReactMultiCrop.prototype.selectionHandler = function (event) {
        var _a = this.props, onSelect = _a.onSelect, onDeselect = _a.onDeselect, image = _a.image;
        if (image === '' || image === null || image === undefined || (image === null || image === void 0 ? void 0 : image.toString().length) === 0)
            return;
        if (onSelect)
            onSelect(ReactMultiCrop.remapSelection(event.selected));
        if (onDeselect)
            onDeselect([]);
    };
    ReactMultiCrop.prototype.selectionClearHandler = function (event) {
        var image = this.props.image;
        if (image === '' || image === null || image === undefined || (image === null || image === void 0 ? void 0 : image.toString().length) === 0)
            return;
        // added
        this.discardActiveObjects();
        var _a = this.props, onSelect = _a.onSelect, onDeselect = _a.onDeselect;
        if (onSelect)
            onSelect([]);
        if (onDeselect)
            onDeselect(ReactMultiCrop.remapSelection(event.deselected));
    };
    // added
    ReactMultiCrop.remapSelection = function (eventList) {
        var objList = [];
        for (var i = 0; i < (eventList === null || eventList === void 0 ? void 0 : eventList.length); i++) {
            var tmpObj = eventList[i];
            objList.push({
                objectId: tmpObj.objectId,
                x: tmpObj.left,
                y: tmpObj.top,
            });
        }
        return objList;
    };
    ReactMultiCrop.prototype.initialCanvas = function () {
        var _a = this.props, id = _a.id, width = _a.width, height = _a.height;
        var canvas = new fabric.Canvas(id || 'canvas', {
            width: width,
            height: height,
        });
        // edit mode
        var doubleClickEvent = this.doubleClickEvent.bind(this);
        var objectModifiedEvent = this.setOutput.bind(this);
        canvas.on('mouse:dblclick', doubleClickEvent);
        canvas.on('object:modified', objectModifiedEvent);
        var zoomHandler = this.zoom.bind(this);
        var selectionObjectHandler = this.selectionHandler.bind(this);
        var selectionObjectClearHandler = this.selectionClearHandler.bind(this);
        canvas.on('selection:created', selectionObjectHandler);
        canvas.on('selection:updated', selectionObjectHandler);
        canvas.on('selection:cleared', selectionObjectClearHandler);
        canvas.on('mouse:wheel', zoomHandler);
        // setup move drag: shift + click
        canvas.on('mouse:down', function (opt) {
            // added
            canvas.getObjects("text").forEach(function (itm) { return itm.visible = false; });
            var evt = opt.e;
            if (evt.shiftKey === true) {
                this.isDragging = true;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }
        });
        canvas.on('mouse:move', function (opt) {
            if (this.isDragging) {
                this.discardActiveObject();
                var e = opt.e;
                var vpt = this.viewportTransform;
                vpt[4] += e.clientX - this.lastPosX;
                vpt[5] += e.clientY - this.lastPosY;
                this.requestRenderAll();
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });
        canvas.on('mouse:up', function () {
            // added
            canvas.getObjects("text").forEach(function (itm) {
                var _a;
                var textLen = ((_a = itm.text) === null || _a === void 0 ? void 0 : _a.length) || 0;
                itm.visible = textLen > 0 || false;
            });
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
        });
        this.setState({ canvas: canvas }, this.initialImage.bind(this));
    };
    ReactMultiCrop.prototype.addNew = function () {
        var canvas = this.state.canvas;
        if (!canvas) {
            return;
        }
        var _a = this.props, borderColor = _a.borderColor, cornerColor = _a.cornerColor, cornerSize = _a.cornerSize, transparentCorners = _a.transparentCorners;
        var coor = {
            id: null,
            rect: { x1: 0, y1: 0, x2: 0.2, y2: 0.2 },
        };
        var attribute = {
            borderColor: borderColor,
            cornerColor: cornerColor,
            cornerSize: cornerSize,
            transparentCorners: transparentCorners,
        };
        var rect = this.createObject(canvas, coor, attribute, false);
        if (!rect) {
            return;
        }
        canvas.add(rect);
        this.setOutput();
    };
    ReactMultiCrop.prototype.doubleClickEvent = function (options) {
        var image = this.props.image;
        if (image === '' || image === null || image === undefined || (image === null || image === void 0 ? void 0 : image.toString().length) === 0)
            return;
        var canvas = this.state.canvas;
        if (!canvas) {
            return;
        }
        // added
        canvas.getObjects("text").forEach(function (itm) { return itm.visible = true; });
        var _a = this.props, readonly = _a.readonly, borderColor = _a.borderColor, cornerColor = _a.cornerColor, cornerSize = _a.cornerSize, transparentCorners = _a.transparentCorners;
        if (options && options.target) {
            var left = options.target.left;
            var top_1 = options.target.top;
            var width = options.target.width;
            var height = options.target.height;
            var attribute = {
                left: left + 50,
                top: top_1 + 50,
                width: width * options.target.scaleX,
                height: height * options.target.scaleY,
                borderColor: borderColor,
                cornerColor: cornerColor,
                cornerSize: cornerSize,
                transparentCorners: transparentCorners,
            };
            var rect = this.createRectByAttribute(null, attribute, readonly || false);
            // added
            var text = new fabric.Text('', {
                fontSize: 17,
                backgroundColor: "black",
                fill: 'white',
                left: left,
                top: top_1 - 20,
                cacheProperties: [rect.objectId],
                selectable: false,
                visible: false
            });
            canvas.add(rect);
            canvas.add(text);
            canvas.discardActiveObject();
            canvas.setActiveObject(rect);
            canvas.requestRenderAll();
            this.setOutput();
        }
        else if (options && options.pointer) {
            var left = options.absolutePointer.x;
            var top_2 = options.absolutePointer.y;
            var attribute = {
                left: left,
                top: top_2,
                width: 100,
                height: 100,
                borderColor: borderColor,
                cornerColor: cornerColor,
                cornerSize: cornerSize,
                transparentCorners: transparentCorners,
            };
            var rect = this.createRectByAttribute(null, attribute, readonly || false);
            // added
            var text = new fabric.Text('', {
                fontSize: 17,
                backgroundColor: "black",
                fill: 'white',
                left: left,
                top: top_2 - 20,
                cacheProperties: [rect.objectId],
                selectable: false,
                visible: false
            });
            canvas.add(rect);
            canvas.add(text);
            canvas.discardActiveObject();
            canvas.setActiveObject(rect);
            canvas.requestRenderAll();
            this.setOutput();
        }
    };
    ReactMultiCrop.prototype.createRectByAttribute = function (existingId, attribute, readonly) {
        var obj = new CustomFabricRect({
            left: attribute.left,
            top: attribute.top,
            width: attribute.width,
            height: attribute.height,
            borderColor: attribute.borderColor,
            cornerColor: attribute.cornerColor,
            cornerSize: attribute.cornerSize,
            transparentCorners: attribute.transparentCorners,
            fill: this.color,
            opacity: this.opacity,
            id: existingId,
            strokeWidth: 0,
            strokeUniform: true,
            lockRotation: true,
            hasRotatingPoint: false,
            lockMovementX: readonly,
            lockMovementY: readonly,
            lockScalingX: readonly,
            lockScalingY: readonly,
            objectId: uuidv4(),
        });
        obj.setControlsVisibility({ mtr: false });
        return obj;
    };
    ReactMultiCrop.convertLeftTop = function (element) {
        var _a, _b, _c, _d;
        if (element.left === undefined ||
            element.top === undefined ||
            ((_a = element.group) === null || _a === void 0 ? void 0 : _a.left) === undefined ||
            ((_b = element.group) === null || _b === void 0 ? void 0 : _b.top) === undefined ||
            ((_c = element.group) === null || _c === void 0 ? void 0 : _c.width) === undefined ||
            ((_d = element.group) === null || _d === void 0 ? void 0 : _d.height) === undefined) {
            return {
                left: 0,
                top: 0,
            };
        }
        return {
            left: element.left + element.group.left + element.group.width / 2,
            top: element.top + element.group.top + element.group.height / 2,
        };
    };
    ReactMultiCrop.prototype.shapetoStructureData = function (element, text) {
        var canvas = this.state.canvas;
        if (!canvas || !canvas.backgroundImage) {
            return null;
        }
        var background = canvas.backgroundImage;
        if (!(background instanceof fabric.Image)) {
            return null;
        }
        if (element.left === undefined ||
            element.top === undefined ||
            element.width === undefined ||
            element.height === undefined ||
            element.scaleX === undefined ||
            element.scaleY === undefined ||
            background.width === undefined ||
            background.height === undefined) {
            return null;
        }
        var _a = this.props, includeDataUrl = _a.includeDataUrl, includeHtmlCanvas = _a.includeHtmlCanvas;
        var dataLeftTop = element.group
            ? ReactMultiCrop.convertLeftTop(element)
            : { left: element.left, top: element.top };
        var x1 = dataLeftTop.left / background.width;
        var y1 = dataLeftTop.top / background.height;
        var x2 = (dataLeftTop.left + element.width * element.scaleX) / background.width;
        var y2 = (dataLeftTop.top + element.height * element.scaleY) / background.height;
        var rectangle = { x1: x1, y1: y1, x2: x2, y2: y2 };
        var coord = {
            id: element.id,
            objectId: element.objectId,
            rect: JSON.stringify(rectangle),
            // added
            textElement: {
                text: text === null || text === void 0 ? void 0 : text.text,
                objectIdRef: (text === null || text === void 0 ? void 0 : text.cacheProperties) ? text === null || text === void 0 ? void 0 : text.cacheProperties[0] : undefined
            }
        };
        // dataUrl
        if (includeDataUrl) {
            var dataUrl = null;
            try {
                dataUrl = background.toDataURL({
                    height: element.getScaledHeight(),
                    width: element.getScaledWidth(),
                    left: dataLeftTop.left,
                    top: dataLeftTop.top,
                    format: 'jpeg',
                });
            }
            catch (error) {
                console.error(error);
            }
            coord.dataUrl = dataUrl;
        }
        // html canvas
        if (includeHtmlCanvas) {
            var canvasElement = null;
            try {
                canvasElement = background.toCanvasElement({
                    height: element.getScaledHeight(),
                    width: element.getScaledWidth(),
                    left: dataLeftTop.left,
                    top: dataLeftTop.top,
                });
            }
            catch (error) {
                console.error(error);
            }
            coord.canvasElement = canvasElement;
        }
        // crop item
        var imgWidth = background.width;
        var imgHeight = background.height;
        var x1Px = x1 * imgWidth;
        var x2Px = x2 * imgWidth;
        var y1Px = y1 * imgHeight;
        var y2Px = y2 * imgHeight;
        var rectanglePx = {
            x: x1Px,
            y: y1Px,
            x2: x2Px,
            y2: y2Px,
            w: x2Px - x1Px,
            h: y2Px - y1Px,
            boundX: imgWidth,
            boundY: imgHeight,
        };
        // added
        text === null || text === void 0 ? void 0 : text.set({
            left: rectanglePx.x,
            top: (rectanglePx.y || 0) - 20
        });
        coord.crop = JSON.stringify(rectanglePx);
        coord.deletedAt = '-1';
        return coord;
    };
    ReactMultiCrop.prototype.deleteActiveShapes = function () {
        var readonly = this.props.readonly;
        var canvas = this.state.canvas;
        if (canvas && !readonly) {
            canvas.getActiveObjects().forEach(function (element) {
                // added
                var textRef = element.objectId;
                var text = canvas.getObjects().filter(function (itm) { return itm.cacheProperties && itm.cacheProperties.includes(textRef); })[0];
                canvas.remove(text);
                canvas.remove(element);
            });
            this.setOutput();
        }
    };
    ReactMultiCrop.prototype.clearCanvas = function () {
        var readonly = this.props.readonly;
        var canvas = this.state.canvas;
        if (canvas && !readonly) {
            canvas.getObjects().forEach(function (element) {
                canvas.remove(element);
            });
            this.setOutput();
        }
    };
    ReactMultiCrop.prototype.setOutput = function () {
        var canvas = this.state.canvas;
        if (!canvas) {
            return;
        }
        var shapeToStructureData = this.shapetoStructureData.bind(this);
        var outputValue = [];
        var cropCoords = canvas.getObjects('rect');
        cropCoords.forEach(function (element) {
            var data = element;
            // added
            var allTextObjects = canvas.getObjects("text");
            var text = allTextObjects.filter(function (obj) { return obj.cacheProperties && obj.cacheProperties.includes(data.objectId); })[0];
            var outputData = shapeToStructureData(data, text);
            if (outputData) {
                outputValue.push(outputData);
            }
        });
        var input = this.props.input;
        if (input) {
            input.onChange(outputValue);
        }
    };
    ReactMultiCrop.prototype.createObject = function (canvas, coor, attribute, readonly) {
        if (!canvas || !canvas.backgroundImage) {
            return null;
        }
        var background = canvas.backgroundImage;
        if (!(background instanceof fabric.Image)) {
            return null;
        }
        if (!background.width || !background.height) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var rectangle;
        if (typeof coor.rect === 'string') {
            rectangle = JSON.parse(coor.rect);
        }
        else {
            rectangle = coor.rect;
        }
        var left = background.width * rectangle.x1;
        var top = background.height * rectangle.y1;
        var right = background.width * rectangle.x2;
        var bottom = background.height * rectangle.y2;
        var width = right - left;
        var height = bottom - top;
        var newAttribute = {
            left: left,
            top: top,
            width: width,
            height: height,
            borderColor: attribute.borderColor,
            cornerColor: attribute.cornerColor,
            cornerSize: attribute.cornerSize,
            transparentCorners: attribute.transparentCorners,
        };
        return this.createRectByAttribute(coor.id, newAttribute, readonly);
    };
    ReactMultiCrop.prototype.discardActiveObjects = function () {
        var canvas = this.state.canvas;
        if (canvas) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
        else {
            console.log('Canvas not defined');
        }
    };
    ReactMultiCrop.prototype.keyboardHandler = function (event) {
        var _a;
        if (event.defaultPrevented)
            return;
        var handled = false;
        if (event.shiftKey) {
            this.multiSelectItems = ((_a = this.state.canvas) === null || _a === void 0 ? void 0 : _a.getActiveObjects()) || [];
            this.multiSelect = true;
        }
        if (event.code == KEY_VALUES.DELETE || event.code == KEY_VALUES.BACKSPACE) {
            this.deleteActiveShapes();
            this.discardActiveObjects();
            handled = true;
        }
        if (handled)
            event.preventDefault();
    };
    ReactMultiCrop.prototype.render = function () {
        var _this = this;
        var _a = this.props, id = _a.id, readonly = _a.readonly, style = _a.style;
        this.resizeCanvas();
        return (React.createElement("div", { id: "canvas-wrapper", ref: this.divRef, tabIndex: 0, style: __assign(__assign({}, style), { margin: 0, padding: 0 }), onKeyDown: readonly ? undefined : this.keyboardHandler, onKeyUp: function () {
                _this.multiSelect = false;
            } },
            React.createElement("canvas", { id: id, style: { margin: 0, padding: 0 } })));
    };
    ReactMultiCrop.defaultProps = {
        borderColor: 'black',
        cornerColor: 'black',
        cornerSize: 13,
        cropBackgroundColor: 'pink',
        cropBackgroundOpacity: 0.5,
        height: 600,
        width: 800,
        id: 'canvas',
        image: undefined,
        includeDataUrl: false,
        includeHtmlCanvas: false,
        input: undefined,
        readonly: false,
        record: {
            clippings: [],
        },
        showButton: false,
        transparentCorners: true,
        zoomChanged: undefined
    };
    return ReactMultiCrop;
}(Component));
export default ReactMultiCrop;
//# sourceMappingURL=ReactMultiCrop.js.map