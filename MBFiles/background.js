function request(URL) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", URL, false);
    xhr.send();
    return new DOMParser().parseFromString(xhr.responseText, "text/html");
};

function directory(document) {
    var result = [];
    var dirArray = document.querySelector(".breadcrumb").childNodes;
    for (var i = 1; i < dirArray.length; i += 2) {
        result.push(dirArray[i].childNodes[1].textContent.trim());
    };
    return result.join("/");
};

function* traversal(document) {
    var roughArray = document.querySelectorAll(".row.file");
    for (var i = 0; i < roughArray.length; i++) {
        var each = roughArray[i].getAttribute("data-ec3-info");
        switch (each) {
            case null:
                var a = roughArray[i].childNodes[1].childNodes[1].getAttribute("href");
                var b = request(a);
                yield* traversal(b);
                break;
            default:
                var result = JSON.parse(each);
                result.dir = directory(document);
                yield result;
        }
    };
    if (document.querySelector(".next a")) {
        var c = document.querySelector(".next a").getAttribute("href");
        var d = request(c);
        yield* traversal(d);
    };
};

function sizeCount(document) {
    return 0;
}

var gen = traversal(document);

function Main(gen) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.text == "GET") {
            var temp = gen.next();
            var message = {
                dir: temp.value.dir,
                name: temp.value.name,
                url: temp.value.download_url
            };
            if (message) {
                sendResponse(message);
            } else {
                sendResponse("END");
            }
        }
    })
};

Main(gen);
