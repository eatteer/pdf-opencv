const pdfCanvas = document.getElementById("pdf-canvas");
const pdfPath = "./contract.pdf";

const initPdf = async () => {
  const pageNumber = 1;
  const pdf = await pdfjsLib.getDocument(pdfPath).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  pdfCanvas.width = viewport.width;
  pdfCanvas.height = viewport.height;
  const context = pdfCanvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
};

const initVSelect = () => {
  const selection = new SelectionArea({
    // Class for the selection-area itself (the element).
    selectionAreaClass: "selection-area",

    // Class for the selection-area container.
    selectionContainerClass: "selection-area-container",

    // Query selector or dom-node to set up container for the selection-area element.
    container: "body",

    // document object - if you want to use it within an embed document (or iframe).
    // If you're inside of a shadow-dom make sure to specify the shadow root here.
    document: window.document,

    // Query selectors for elements which can be selected.
    selectables: [],

    // Query selectors for elements from where a selection can be started from.
    startareas: ["#pdf-canvas"],

    // Query selectors for elements which will be used as boundaries for the selection.
    // The boundary will also be the scrollable container if this is the case.
    boundaries: ["#pdf-canvas"],

    // Behaviour related options.
    behaviour: {
      // Specifies what should be done if already selected elements get selected again.
      //   invert: Invert selection for elements which were already selected
      //   keep: Keep selected elements (use clearSelection() to remove those)
      //   drop: Remove stored elements after they have been touched
      overlap: "invert",

      // On which point an element should be selected.
      // Available modes are cover (cover the entire element), center (touch the center) or
      // the default mode is touch (just touching it).
      intersect: "touch",

      // px, how many pixels the point should move before starting the selection (combined distance).
      // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
      startThreshold: 10,

      // Scroll configuration.
      scrolling: {
        // On scrollable areas the number on px per frame is devided by this amount.
        // Default is 10 to provide a enjoyable scroll experience.
        speedDivider: 10,

        // Browsers handle mouse-wheel events differently, this number will be used as
        // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
        manualSpeed: 750,

        // This property defines the virtual inset margins from the borders of the container
        // component that, when crossed by the mouse/touch, trigger the scrolling. Useful for
        // fullscreen containers.
        startScrollMargins: { x: 0, y: 0 },
      },
    },

    // Features.
    features: {
      // Enable / disable touch support.
      touch: true,

      // Range selection.
      range: true,

      // Configuration in case a selectable gets just clicked.
      singleTap: {
        // Enable single-click selection (Also disables range-selection via shift + ctrl).
        allow: true,

        // 'native' (element was mouse-event target) or 'touch' (element visually touched).
        intersect: "native",
      },
    },
  });

  selection.on("stop", (event) => {
    const selectionArea = selection.getSelectionArea();
    const rect = selectionArea.getBoundingClientRect();
    const element = document.createElement("div");
    element.classList.add("interesting-area");
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.top = `${rect.top}px`;
    element.style.left = `${rect.left}px`;
    pdfCanvas.append(element);
    console.log(element);
    signPdf(rect);
  });
};

const signPdf = (rect) => {
  const pdfImg = cv.imread(pdfCanvas);
  const signatureImg = cv.imread("signature");

  // Resize signatureImg
  const resizedSignatureImg = new cv.Mat();
  cv.resize(
    signatureImg,
    resizedSignatureImg,
    new cv.Size(rect.width, rect.height),
    0,
    0,
    cv.INTER_AREA
  );

  // Create a new image with the same dimensions as pdfImg
  let mergedImg = new cv.Mat(pdfImg.rows, pdfImg.cols, pdfImg.type());

  // Copy pdfImg to the new image
  pdfImg.copyTo(mergedImg);

  // Copy resizedSignature onto the new image at the desired position
  resizedSignatureImg.copyTo(
    mergedImg.roi(
      new cv.Rect(
        rect.left,
        rect.top,
        resizedSignatureImg.cols,
        resizedSignatureImg.rows
      )
    )
  );

  //   console.log(rect.width, rect.height);
  //   console.log(resizedSignatureImg.cols, resizedSignatureImg.rows);

  // Display the merged image
  cv.imshow("pdf-canvas", mergedImg);
};

const main = async () => {
  await initPdf();
  await initVSelect();
};

main();
