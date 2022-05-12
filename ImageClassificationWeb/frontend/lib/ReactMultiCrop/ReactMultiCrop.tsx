import React, {Component} from 'react';
import {fabric} from 'fabric';
import {v4 as uuidv4} from 'uuid';
import {CustomFabricRect, IAttribute, ICoord, IOutputData, IReactMultiCropProps, IReactMultiCropStates} from "@berviantoleo/react-multi-crop";
import {KEY_VALUES} from "rsuite/utils";

export interface IReactMultiCropPropsExt extends IReactMultiCropProps {
    activeObjects?: Array<string>,// added
    colorMap?: Map<string, string>,// added
    resultMap?: Map<string, string>,// added

    onSelect?(value: any | null): void;// added

    onDeselect?(value: any | null): void;// added

    onMoved?(value: any | null): void;// added
}
// added
export interface IOutputDataExt extends IOutputData {
    textElement?: any
}

class ReactMultiCrop extends Component<IReactMultiCropPropsExt, IReactMultiCropStates> {
    public static defaultProps: IReactMultiCropPropsExt = {
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

    private multiSelect: boolean = false;
    private multiSelectItems: fabric.Object[] = []
    private readonly color: string;
    private readonly opacity: number;
    private REGEXP_ORIGINS = /^(\w+:)\/\/([^:/?#]*):?(\d*)/i;
    private divRef = React.createRef<HTMLDivElement>();

    constructor(props: IReactMultiCropPropsExt) {
        super(props);

        this.state = {
            canvas: null,
            initial: true,
        };

        this.color = props.cropBackgroundColor || 'yellow';
        this.opacity = props.cropBackgroundOpacity || 0.5;

        this.keyboardHandler = this.keyboardHandler.bind(this);
        this.addNew = this.addNew.bind(this);
        this.deleteActiveShapes = this.deleteActiveShapes.bind(this);
        this.discardActiveObjects = this.discardActiveObjects.bind(this);
    }
    // added
    resizeCanvas = () => {
        const {canvas} = this.state;
        const {height} = this.props;
        const outerCanvasContainer = this.divRef.current

        if (outerCanvasContainer && canvas && height) {
            const ratio = canvas.getWidth() / canvas.getHeight();
            const containerWidth = outerCanvasContainer.clientWidth;
            const containerHeightRatio = containerWidth / ratio;
            const containerHeight =
                containerHeightRatio > height ? height
                    : containerHeightRatio < height / 2 ? height
                        : containerHeightRatio
            canvas.setDimensions({width: containerWidth, height: containerHeight});
        }
    };

    componentDidMount(): void {
        const {canvas} = this.state;
        if (!canvas) {
            this.initialCanvas();
        }
        window.addEventListener('resize', this.resizeCanvas)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeCanvas);
    }
// added
    arrayEquals(a: Array<any>, b: Array<any>) {
        return Array.isArray(a)
            && Array.isArray(b)
            && a.length === b.length
            && a.every((val, index) => val === b[index]);
    }

    componentDidUpdate(prevProps: any): void {
        const {canvas} = this.state;
        if (canvas) {
            const {zoomLevel, activeObject, activeObjects, colorMap, resultMap} = this.props;

            this.updateZoom(canvas, prevProps, zoomLevel)
            this.updateBgImage(canvas, prevProps)
            this.updateColors(canvas, prevProps, colorMap)
            this.updateTexts(canvas, prevProps, resultMap)
            this.updateActive(canvas, prevProps, activeObject, activeObjects)
        }
    }

    private updateActive = (canvas: fabric.Canvas, prevProps: any, activeObject?: string, activeObjects?: Array<string>) => {
        // prev active object
        const prevActive = prevProps.activeObject;
        if (prevActive !== activeObject && activeObject) {
            const dataObjects = canvas.getObjects();
            const allSelected = dataObjects.filter(
                (obj: fabric.Object) => (obj as CustomFabricRect).objectId === activeObject,
            );
            canvas.discardActiveObject();
            for (const objectSelect of allSelected) {
                canvas.setActiveObject(objectSelect);
            }
            canvas.requestRenderAll();
        }

        // prev active objects (list)// added
        const prevActiveList = prevProps.activeObjects;
        if (activeObjects && !this.arrayEquals(prevActiveList, activeObjects)) {
            const dataObjects = canvas.getObjects();
            const allSelected = dataObjects.filter(
                (obj: fabric.Object) => activeObjects.includes((obj as CustomFabricRect).objectId),
            );
            this.setActiveSelection(canvas, allSelected);
        }

        if (this.multiSelect) {

            const prevMultiSelectItems = [...this.multiSelectItems];
            const currentMultiSelectItems = this.addToMultiselect(canvas.getActiveObjects())
            this.multiSelectItems = currentMultiSelectItems

            if (!this.arrayEquals(prevMultiSelectItems, currentMultiSelectItems)) {
                this.setActiveSelection(canvas, currentMultiSelectItems);
            }
        }
    }

    private updateZoom = (canvas: fabric.Canvas, prevProps: any, zoomLevel?: number) => {
        const prevZoomLevel = prevProps.zoomLevel;
        if (prevZoomLevel !== zoomLevel && zoomLevel && zoomLevel > 0) {
            let centerPoint = new fabric.Point(canvas.getCenter().left, canvas.getCenter().top)
            canvas.zoomToPoint(centerPoint, zoomLevel)
            canvas.renderAll();
        }
    }
// added
    private updateColors = (canvas: fabric.Canvas, prevProps: any, colorMap?: Map<string, string>) => {
        const prevColorMap = prevProps.colorMap;
        if (colorMap && prevColorMap != colorMap) {
            canvas.getObjects("rect").forEach((obj: fabric.Object) => {
                    let objectId = (obj as CustomFabricRect).objectId
                    let color = colorMap.get(objectId);
                    if (color) obj.set("fill", color)
                }
            )
            canvas.requestRenderAll()
        }
    }
// added
    private updateTexts = (canvas: fabric.Canvas, prevProps: any, resultMap?: Map<string, string>) => {
        const prevResultMap = prevProps.resultMap;
        if (resultMap && prevResultMap != resultMap) {
            canvas.getObjects("rect").forEach((obj: fabric.Object) => {
                    let objectId = (obj as CustomFabricRect).objectId
                    let result = resultMap.get(objectId);
                    let textObj = canvas.getObjects().filter((itm) => itm.cacheProperties && itm.cacheProperties.includes(objectId))[0]
                    if (result !== undefined) {
                        (textObj as fabric.Text).text = '  ' + result + '  ';
                        textObj.visible = true;
                    } else {
                        (textObj as fabric.Text).text = '';
                        textObj.visible = false;
                    }
                }
            )
            canvas.requestRenderAll()
        }
    }
// added
    private updateBgImage = (canvas: fabric.Canvas, prevProps: any,) => {
        const {image} = this.props;
        const prevImage = prevProps.image;
        if (image && prevImage !== image) {
            this.clearCanvas();
            this.initialImage();
            canvas.requestRenderAll()
        }
    }

    private setActiveSelection(canvas: any, items: any) {

        const options: fabric.IObjectOptions = {
            canvas: canvas,
            borderColor: this.props.borderColor,
            cornerColor: this.props.cornerColor,
            cornerSize: this.props.cornerSize,
            transparentCorners: this.props.transparentCorners,
        };
        canvas.discardActiveObject();
        let selection = new fabric.ActiveSelection(items, options);
        canvas.setActiveObject(selection);
        canvas.requestRenderAll()
    }

    loadImage(img: fabric.Image): void {
        const {initial, canvas} = this.state;
        if (!canvas) {
            return;
        }
        if (!canvas.width || !canvas.height || !img.height || !img.width) {
            return;
        }
        const {zoomLevel} = this.props;
        // detect ratio
        const ratio = img.height / img.width;
        const newHeight = canvas.width * ratio;
        canvas.setHeight(newHeight);
// added
        let centerPoint = new fabric.Point(canvas.getCenter().left, canvas.getCenter().top)

        if (zoomLevel) {
            canvas.zoomToPoint(centerPoint, zoomLevel)
        } else {
            canvas.zoomToPoint(centerPoint, canvas.width / img.width)
        }
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        if (initial) {
            this.setState({initial: false}, this.initialObjects.bind(this));
        }
    }

    isCrossOriginURL(url: string): boolean {
        const parts = url.match(this.REGEXP_ORIGINS);
        return (
            parts !== null &&
            (parts[1] !== window.location.protocol ||
                parts[2] !== window.location.hostname ||
                parts[3] !== window.location.port)
        );
    }

    initialImage(): void {
        const {image} = this.props;
        const loadImageNow = this.loadImage.bind(this);
        if (image) {
            const isCrossOrigin = this.isCrossOriginURL(image);
            const options: any = {};
            if (isCrossOrigin) {
                options.crossOrigin = null;
            }
            fabric.Image.fromURL(image, loadImageNow, options);
        }
    }

    initialObjects(): void {
        const {canvas} = this.state;
        if (!canvas) {
            return;
        }
        const {record, readonly, borderColor, cornerColor, cornerSize, transparentCorners} =
            this.props;
        if (record) {
            const inputObject = record.clippings;
            if (
                Array.isArray(inputObject) &&
                inputObject.length > 0 &&
                typeof inputObject[0] === 'object'
            ) {
                const attribute: IAttribute = {
                    borderColor: borderColor,
                    cornerColor: cornerColor,
                    cornerSize: cornerSize,
                    transparentCorners: transparentCorners,
                };
                let totalRendered = 0;
                for (const coord of inputObject) {
                    const rect = this.createObject(canvas, coord, attribute, readonly || false);
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
        } else {
            console.log('Not have any record. Skipped.');
        }
    }

    zoom(options: any): void {

        const {image} = this.props;
        if (image === '' || image === null || image === undefined || image?.toString().length === 0) return

        if (!options.e.shiftKey) return

        const {canvas} = this.state;
        if (!canvas) return;

        const delta = options.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        // added
        canvas.zoomToPoint(new fabric.Point(canvas.getCenter().left, canvas.getCenter().top), zoom)
        options.e.preventDefault();
        options.e.stopPropagation();

        const {zoomChanged} = this.props;
        if (zoomChanged) zoomChanged(zoom);
    }

    mouseHover(options: any): void {
        const {onHover} = this.props;
        const converter = this.shapetoStructureData.bind(this);
        const target = options.target;
        if (target && target.type === 'rect' && onHover) {
            const data = converter(target);
            onHover(data);
        }
    }

    mouseOut(options: any): void {
        const {onHover} = this.props;
        const target = options.target;
        if (target && target.type === 'rect' && onHover) {
            onHover(null);
        }
    }
// added
    addToMultiselect(fromList: Array<any>) {

        const currentMultiSelect = [...this.multiSelectItems]

        let toListIds = this.multiSelectItems.map((itm) => {
            return (itm as CustomFabricRect).objectId
        })
        fromList.forEach((itm) => {
            if (!toListIds.includes(itm.objectId)) {
                currentMultiSelect.push(itm)
            }
        })

        return currentMultiSelect
    }

    selectionHandler(event: any): void {
        const {onSelect, onDeselect, image} = this.props;
        if (image === '' || image === null || image === undefined || image?.toString().length === 0) return
        if (onSelect) onSelect(ReactMultiCrop.remapSelection(event.selected));
        if (onDeselect) onDeselect([]);

    }

    selectionClearHandler(event: any): void {
        const {image} = this.props;
        if (image === '' || image === null || image === undefined || image?.toString().length === 0) return
// added
        this.discardActiveObjects()
        const {onSelect, onDeselect} = this.props;
        if (onSelect) onSelect([]);
        if (onDeselect) onDeselect(ReactMultiCrop.remapSelection(event.deselected))

    }
// added
    private static remapSelection(eventList: Array<any>): Array<any> {
        let objList = []
        for (let i = 0; i < eventList?.length; i++) {
            let tmpObj = eventList[i]
            objList.push({
                objectId: tmpObj.objectId,
                x: tmpObj.left,
                y: tmpObj.top,
            })
        }
        return objList
    }

    initialCanvas(): void {
        const {id, width, height} = this.props;
        const canvas = new fabric.Canvas(id || 'canvas', {
            width: width,
            height: height,
        });

        // edit mode
        const doubleClickEvent = this.doubleClickEvent.bind(this);
        const objectModifiedEvent = this.setOutput.bind(this);
        canvas.on('mouse:dblclick', doubleClickEvent);
        canvas.on('object:modified', objectModifiedEvent);
        const zoomHandler = this.zoom.bind(this);
        const selectionObjectHandler = this.selectionHandler.bind(this);
        const selectionObjectClearHandler = this.selectionClearHandler.bind(this);
        canvas.on('selection:created', selectionObjectHandler);
        canvas.on('selection:updated', selectionObjectHandler);
        canvas.on('selection:cleared', selectionObjectClearHandler);
        canvas.on('mouse:wheel', zoomHandler);
        // setup move drag: shift + click
        canvas.on('mouse:down', function (opt: any) {
            // added
            canvas.getObjects("text").forEach((itm) => itm.visible = false)
            const evt = opt.e;

            if (evt.shiftKey === true) {
                this.isDragging = true;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }

        });
        canvas.on('mouse:move', function (opt: any) {
            if (this.isDragging) {
                this.discardActiveObject();
                const e = opt.e;
                const vpt = this.viewportTransform;
                vpt[4] += e.clientX - this.lastPosX;
                vpt[5] += e.clientY - this.lastPosY;
                this.requestRenderAll();
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });
        canvas.on('mouse:up', function () {
            // added
            canvas.getObjects("text").forEach((itm) => {
                let textLen: number = (itm as fabric.Text).text?.length || 0
                itm.visible = textLen > 0 || false
            })
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
        });

        this.setState({canvas}, this.initialImage.bind(this));

    }

    addNew(): void {
        const {canvas} = this.state;
        if (!canvas) {
            return;
        }
        const {borderColor, cornerColor, cornerSize, transparentCorners} = this.props;
        const coor: ICoord = {
            id: null,
            rect: {x1: 0, y1: 0, x2: 0.2, y2: 0.2},
        };
        const attribute: IAttribute = {
            borderColor: borderColor,
            cornerColor: cornerColor,
            cornerSize: cornerSize,
            transparentCorners: transparentCorners,
        };
        const rect = this.createObject(canvas, coor, attribute, false);
        if (!rect) {
            return;
        }
        canvas.add(rect);
        this.setOutput();
    }

    doubleClickEvent(options: any): void {
        const {image} = this.props;
        if (image === '' || image === null || image === undefined || image?.toString().length === 0) return

        const {canvas} = this.state;
        if (!canvas) {
            return;
        }
        // added
        canvas.getObjects("text").forEach((itm) => itm.visible = true)
        const {readonly, borderColor, cornerColor, cornerSize, transparentCorners} = this.props;
        if (options && options.target) {
            const left = options.target.left;
            const top = options.target.top;
            const width = options.target.width;
            const height = options.target.height;
            const attribute: IAttribute = {
                left: left + 50,
                top: top + 50,
                width: width * options.target.scaleX,
                height: height * options.target.scaleY,
                borderColor: borderColor,
                cornerColor: cornerColor,
                cornerSize: cornerSize,
                transparentCorners: transparentCorners,
            };
            const rect = this.createRectByAttribute(null, attribute, readonly || false);
            // added
            const text = new fabric.Text('',
                {
                    fontSize: 17,
                    backgroundColor: "black",
                    fill: 'white',
                    left: left,
                    top: top - 20,
                    cacheProperties: [rect.objectId],
                    selectable: false,
                    visible: false
                }
            );

            canvas.add(rect);
            canvas.add(text);
            canvas.discardActiveObject();
            canvas.setActiveObject(rect);
            canvas.requestRenderAll();
            this.setOutput();
        } else if (options && options.pointer) {
            const left = options.absolutePointer.x;
            const top = options.absolutePointer.y;
            const attribute: IAttribute = {
                left: left,
                top: top,
                width: 100,
                height: 100,
                borderColor: borderColor,
                cornerColor: cornerColor,
                cornerSize: cornerSize,
                transparentCorners: transparentCorners,
            };
            const rect = this.createRectByAttribute(null, attribute, readonly || false);
            // added
            const text = new fabric.Text('',
                {
                    fontSize: 17,
                    backgroundColor: "black",
                    fill: 'white',
                    left: left,
                    top: top - 20,
                    cacheProperties: [rect.objectId],
                    selectable: false,
                    visible: false
                }
            );

            canvas.add(rect);
            canvas.add(text);
            canvas.discardActiveObject();
            canvas.setActiveObject(rect);
            canvas.requestRenderAll();
            this.setOutput();
        }
    }

    createRectByAttribute(existingId: string | null, attribute: IAttribute, readonly: boolean): CustomFabricRect {

        let obj: CustomFabricRect = new CustomFabricRect({
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
            hasRotatingPoint: false,// added
            lockMovementX: readonly,
            lockMovementY: readonly,
            lockScalingX: readonly,
            lockScalingY: readonly,
            objectId: uuidv4(),
        });
        obj.setControlsVisibility({mtr: false})
        return obj;
    }

    private static convertLeftTop(element: CustomFabricRect): { left: number; top: number } {
        if (
            element.left === undefined ||
            element.top === undefined ||
            element.group?.left === undefined ||
            element.group?.top === undefined ||
            element.group?.width === undefined ||
            element.group?.height === undefined
        ) {
            return {
                left: 0,
                top: 0,
            };
        }
        return {
            left: element.left + element.group.left + element.group.width / 2,
            top: element.top + element.group.top + element.group.height / 2,
        };
    }

    shapetoStructureData(element: CustomFabricRect, text?: fabric.Text): IOutputDataExt | null {
        const {canvas} = this.state;
        if (!canvas || !canvas.backgroundImage) {
            return null;
        }
        const background = canvas.backgroundImage;
        if (!(background instanceof fabric.Image)) {
            return null;
        }
        if (
            element.left === undefined ||
            element.top === undefined ||
            element.width === undefined ||
            element.height === undefined ||
            element.scaleX === undefined ||
            element.scaleY === undefined ||
            background.width === undefined ||
            background.height === undefined
        ) {
            return null;
        }
        const {includeDataUrl, includeHtmlCanvas} = this.props;
        const dataLeftTop = element.group
            ? ReactMultiCrop.convertLeftTop(element)
            : {left: element.left, top: element.top};
        const x1 = dataLeftTop.left / background.width;
        const y1 = dataLeftTop.top / background.height;
        const x2 = (dataLeftTop.left + element.width * element.scaleX) / background.width;
        const y2 = (dataLeftTop.top + element.height * element.scaleY) / background.height;
        const rectangle = {x1: x1, y1: y1, x2: x2, y2: y2};
        const coord: IOutputDataExt = {
            id: element.id,
            objectId: element.objectId,
            rect: JSON.stringify(rectangle),
            // added
            textElement: {
                text: text?.text,
                objectIdRef: text?.cacheProperties ? text?.cacheProperties[0] : undefined
            }
        };
        // dataUrl
        if (includeDataUrl) {
            let dataUrl: string | null = null;
            try {
                dataUrl = background.toDataURL({
                    height: element.getScaledHeight(),
                    width: element.getScaledWidth(),
                    left: dataLeftTop.left,
                    top: dataLeftTop.top,
                    format: 'jpeg',
                });
            } catch (error) {
                console.error(error);
            }
            coord.dataUrl = dataUrl;
        }
        // html canvas
        if (includeHtmlCanvas) {
            let canvasElement = null;
            try {
                canvasElement = background.toCanvasElement({
                    height: element.getScaledHeight(),
                    width: element.getScaledWidth(),
                    left: dataLeftTop.left,
                    top: dataLeftTop.top,
                });
            } catch (error) {
                console.error(error);
            }
            coord.canvasElement = canvasElement;
        }
        // crop item
        const imgWidth = background.width;
        const imgHeight = background.height;
        const x1Px = x1 * imgWidth;
        const x2Px = x2 * imgWidth;
        const y1Px = y1 * imgHeight;
        const y2Px = y2 * imgHeight;
        const rectanglePx = {
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
        text?.set({
            left: rectanglePx.x,
            top: (rectanglePx.y || 0) - 20
        });
        coord.crop = JSON.stringify(rectanglePx);
        coord.deletedAt = '-1';
        return coord;
    }

    deleteActiveShapes(): void {
        const {readonly} = this.props;
        const {canvas} = this.state;
        if (canvas && !readonly) {
            canvas.getActiveObjects().forEach(function (element) {
                // added
                let textRef = (element as CustomFabricRect).objectId
                let text = canvas.getObjects().filter((itm) => itm.cacheProperties && itm.cacheProperties.includes(textRef))[0]
                canvas.remove(text)
                canvas.remove(element);
            });
            this.setOutput();
        }
    }

    clearCanvas(): void {
        const {readonly} = this.props;
        const {canvas} = this.state;
        if (canvas && !readonly) {
            canvas.getObjects().forEach(function (element) {
                canvas.remove(element);
            });
            this.setOutput();
        }
    }

    setOutput(): void {
        const {canvas} = this.state;
        if (!canvas) {
            return;
        }
        const shapeToStructureData = this.shapetoStructureData.bind(this);
        const outputValue: Array<IOutputDataExt> = [];
        const cropCoords = canvas.getObjects('rect');
        cropCoords.forEach(function (element: fabric.Object) {
            const data = element as CustomFabricRect;
            // added
            const allTextObjects = canvas.getObjects("text")
            const text = allTextObjects.filter((obj) => obj.cacheProperties && obj.cacheProperties.includes(data.objectId))[0]
            const outputData = shapeToStructureData(data, text as fabric.Text);
            if (outputData) {
                outputValue.push(outputData);
            }
        });
        const {input} = this.props;

        if (input) {
            input.onChange(outputValue);
        }
    }

    createObject(canvas: fabric.Canvas | null, coor: ICoord, attribute: IAttribute, readonly: boolean): CustomFabricRect | null {
        if (!canvas || !canvas.backgroundImage) {
            return null;
        }
        const background = canvas.backgroundImage;
        if (!(background instanceof fabric.Image)) {
            return null;
        }
        if (!background.width || !background.height) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rectangle: any;
        if (typeof coor.rect === 'string') {
            rectangle = JSON.parse(coor.rect);
        } else {
            rectangle = coor.rect;
        }
        const left = background.width * rectangle.x1;
        const top = background.height * rectangle.y1;
        const right = background.width * rectangle.x2;
        const bottom = background.height * rectangle.y2;
        const width = right - left;
        const height = bottom - top;
        const newAttribute: IAttribute = {
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
    }

    discardActiveObjects(): void {
        const {canvas} = this.state;
        if (canvas) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        } else {
            console.log('Canvas not defined');
        }
    }

    keyboardHandler(event: any): void {

        if (event.defaultPrevented) return

        let handled = false;

        if (event.shiftKey) {
            this.multiSelectItems = this.state.canvas?.getActiveObjects() || []
            this.multiSelect = true
        }

        if (event.code == KEY_VALUES.DELETE || event.code == KEY_VALUES.BACKSPACE) {
            this.deleteActiveShapes()
            this.discardActiveObjects()
            handled = true;
        }

        if (handled) event.preventDefault()
    }

    render(): JSX.Element {
        const {id, readonly, style} = this.props;
        this.resizeCanvas()
        return (

            <div id="canvas-wrapper" ref={this.divRef} tabIndex={0}
                 style={{...style, margin: 0, padding: 0}}
                 onKeyDown={readonly ? undefined : this.keyboardHandler}
                 onKeyUp={() => {
                     this.multiSelect = false
                 }}>
                <canvas id={id} style={{margin: 0, padding: 0}}/>
            </div>
        );
    }
}

export default ReactMultiCrop;
