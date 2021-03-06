let video, contours, src2, toShow, cap, FPS, threshold1, threshold2, apertureSize, dilate, anchora, closedKsize, ksizea;

function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {

        var player = document.getElementById('player');
        var snapshotCanvas = document.getElementById('snapshot');
        var captureButton = document.getElementById('capture');

        var handleSuccess = function (stream) {
            // Attach the video stream to the video element and autoplay.
            player.srcObject = stream;
        };

        captureButton.addEventListener('click', function () {
            var context = snapshot.getContext('2d');
            // Draw the video frame to the canvas.
            context.drawImage(player, 0, 0, snapshotCanvas.width,
                snapshotCanvas.height);
            process();
        });


        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true})
                .then(handleSuccess);

            // Not adding `{ audio: true }` since we only want video now
            navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                //video.src = window.URL.createObjectURL(stream);
                video.srcObject = stream;
                video.play();
            });
        }
        video = document.getElementById('video');


        cap = new cv.VideoCapture(video);

        FPS = 5;
    };
}

function process() {
    threshold1 = parseFloat(document.getElementById('threshold1').value),
        threshold2 = parseFloat(document.getElementById('threshold2').value),
        apertureSize = parseFloat(document.getElementById('apertureSize').value),
        dilate = parseFloat(document.getElementById('dilate').value),
        anchora = parseFloat(document.getElementById('anchor').value),
        closedKsize = parseFloat(document.getElementById('closedKsize').value),
        ksizea = parseFloat(document.getElementById('ksize').value);
    try {
        src2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        toShow = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat();
        let begin = Date.now();
        cap.read(src2);
        cap.read(toShow);

        let src1 = cv.imread("snapshot");
        // let toShow = cv.imread("test");
        // let src2 = cv.imread("test");
        gray(src1);
        gray(src2);
        cv.imshow('grayscale', src2);

        gaussianBlur(src1);
        gaussianBlur(src2);
        cv.imshow('blur', src2);

        cv.subtract(src1, src2, dst);

        cv.imshow('subtract', dst);

        dilatef(dst);
        cv.imshow('dilatei', dst);

        cv.Canny(dst, dst, threshold1, threshold2, apertureSize, false);

        cv.imshow('canny', dst);

        closed(dst);
        cv.imshow('closed', dst);

        let biggestPerimaterContour = findAndDrawContours(dst);
        cv.imshow('contours', dst);

        if (biggestPerimaterContour !== undefined) {
            drawExtremePoints(biggestPerimaterContour, toShow);
            cv.imshow('rect', toShow);

            // drawMinRect(biggestPerimaterContour, toShow);
        }
        // cv.imshow('rect', toShow);

        toShow.delete();
        src1.delete();
        src2.delete();
        dst.delete();
        contours.delete();

        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(process, delay);
    } catch (e) {
        console.log(e);
    }
}

function drawExtremePoints(cnt, src) {
    var lcntPoint = [];
    for (let i = 0; i < cnt.rows; i++) {
        lcntPoint.push({x: cnt.data32S[i * 2], y: cnt.data32S[i * 2 + 1]});
    }
    var a = findSmallestSum(lcntPoint);
    var extLeft = [a.x, a.y];

    a = findMaxSum(lcntPoint);
    var extRight = [a.x, a.y];

    a = findSmallestDiff(lcntPoint);
    var extTop = [a.x, a.y];

    a = findLargestDiff(lcntPoint);
    var extBottom = [a.x, a.y];

    function findSmallestSum(arr) {
        let smallestSum = (arr[0].x + arr[0].y);
        let index = 0;
        for (let i = 1; i < arr.length; i++) {
            if ((arr[i].x + arr[i].y) < smallestSum) {
                smallestSum = arr[i].x + arr[i].y;
                index = i;
            }
        }
        return arr[index];
    }

    function findMaxSum(arr) {
        let maxSum = (arr[0].x + arr[0].y);
        let index = 0;
        for (let i = 1; i < arr.length; i++) {
            if ((arr[i].x + arr[i].y) > maxSum) {
                maxSum = arr[i].x + arr[i].y;
                index = i;
            }
        }
        return arr[index];
    }

    function findSmallestDiff(arr) {
        let smallestDiff = arr[0].y - arr[0].x;
        let index = 0;
        for (let i = 1; i < arr.length; i++) {
            if ((arr[i].y - arr[i].x) < smallestDiff) {
                smallestDiff = arr[i].y - arr[i].x;
                index = i;
            }
        }
        return arr[index];
    }

    function findLargestDiff(arr) {
        let largestDiff = arr[0].y - arr[0].x;
        let index = 0;
        for (let i = 1; i < arr.length; i++) {
            if ((arr[i].y - arr[i].x) > largestDiff) {
                largestDiff = arr[i].y - arr[i].x;
                index = i;
            }
        }
        return arr[index];
    }

    // console.log(`extreme left: ${extLeft}`);
    // console.log(`extreme top: ${extTop}`);
    // console.log(`extreme bottom: ${extBottom}`);
    // console.log(`extreme right: ${extRight}`);

    let circlel = new cv.Circle(new cv.Point(...extLeft), 3);
    let circler = new cv.Circle(new cv.Point(...extRight), 3);
    let circlet = new cv.Circle(new cv.Point(...extTop), 3);
    let circleb = new cv.Circle(new cv.Point(...extBottom), 3);
    let circleColor = new cv.Scalar(255, 0, 0, 255);
    let lineColor = new cv.Scalar(0, 177, 106, 255);

    cv.line(src, circlel.center, circlet.center, lineColor, 2, cv.LINE_AA, 0);
    cv.line(src, circlet.center, circler.center, lineColor, 2, cv.LINE_AA, 0);
    cv.line(src, circler.center, circleb.center, lineColor, 2, cv.LINE_AA, 0);
    cv.line(src, circleb.center, circlel.center, lineColor, 2, cv.LINE_AA, 0);

    cv.circle(src, circlel.center, circlel.radius, circleColor);
    cv.circle(src, circler.center, circler.radius, circleColor);
    cv.circle(src, circlet.center, circlet.radius, circleColor);
    cv.circle(src, circleb.center, circleb.radius, circleColor);

}

function gray(src) {
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
}

function gaussianBlur(src) {
    let ksize = new cv.Size(ksizea, ksizea);
    cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);
}

function dilatef(src) {
    let M = cv.Mat.ones(dilate, dilate, cv.CV_8U);

    let anchor = new cv.Point(anchora, anchora);
    cv.dilate(src, src, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    M.delete();
}

function closed(src) {

    let closedKsizeaa = new cv.Size(closedKsize, closedKsize);

    let kernel = cv.getStructuringElement(cv.MORPH_RECT, closedKsizeaa);
    cv.morphologyEx(src, src, cv.MORPH_GRADIENT, kernel);

    kernel.delete();

}

function findAndDrawContours(src) {
    contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    let hull = new cv.MatVector();

    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.convexHull(cnt, tmp, false, true);
        hull.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
    let max = 0;
    let index = 0;
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        // if (max < cv.arcLength(cnt, true)) {
        //     index = i;
        //     max = cv.arcLength(cnt, true);
        // }
        if (max < cv.contourArea(cnt, false)) {
            index = i;
            max = cv.contourArea(cnt, false);
        }
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
            Math.round(Math.random() * 255));
        cv.drawContours(src, hull, i, color, 1, cv.LINE_8, hierarchy, 100);
    }

    hierarchy.delete();
    hull.delete();
    return contours.get(index);
}

function drawMinRect(cnt, src) {
    let rotatedRect = cv.minAreaRect(cnt);
    let vertices = cv.RotatedRect.points(rotatedRect);
    let rectangleColor = new cv.Scalar(0, 177, 106, 255);

    for (let i = 0; i < 4; i++) {
        cv.line(src, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
    }

}

