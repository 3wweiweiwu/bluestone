module.exports = [
    {
        command: "goto",
        target: "http://localhost:3607/site/singlePageHappyPath.html",
        iframe: [],
        potentialMatch: [],
        framePotentialMatch: [],
        __htmlPath: null,
        targetPicPath: null,
        timeoutMs: null,
        meta: {},
        isRequiredReview: false,
        isRequiredLocatorUpdate: false,
        isRequiredNewNameAndLocator: false,
        finalLocatorName: "FAKE locator name to avoid check",
        finalLocator: "FAKE locator to avoid check",
        functionAst: {
            path: "",
            name: "goto",
            description: "Navigate browser to he url",
            params: [
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Frame" },
                    name: "page",
                },
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "string" },
                    name: "url",
                    value: "http://localhost:3607/site/singlePageHappyPath.html",
                },
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Browser" },
                    name: "browser",
                },
            ],
            locators: [{ locator: ["invalid_locator"] }],
        },
        result: { isResultPass: false, resultText: "" },
        timeStamp: null,
    },
    {
        command: "waitElementExists",
        target: "//*[@id='div1']",
        iframe: [],
        potentialMatch: [],
        framePotentialMatch: [],
        __htmlPath: null,
        targetInnerText: "This is a paragrah",
        targetPicPath: null,
        timeoutMs: null,
        meta: {},
        isRequiredReview: false,
        isRequiredLocatorUpdate: false,
        isRequiredNewNameAndLocator: false,
        finalLocatorName: "",
        finalLocator: [""],
        functionAst: {
            path: "",
            name: "waitElementExists",
            description: "element exists",
            params: [
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Frame" },
                    name: "frame",
                },
                {
                    title: "param",
                    description: "element selector object",
                    type: { type: "NameExpression", name: "ElementSelector" },
                    name: "elementSelector",
                },
                {
                    title: "param",
                    description: "healing snapshot file",
                    type: { type: "NameExpression", name: "HealingSnapshot" },
                    name: "healingSnapshot",
                    value: "",
                },
            ],
            locators: [{ locator: ["invalid_locator"] }],
            returnJsDoc: {
                title: "returns",
                description: null,
                type: { type: "NameExpression", name: "ElementHandle" },
            },
        },
        parameter: [
            {
                title: "param",
                description: null,
                type: { type: "NameExpression", name: "Frame" },
                name: "frame",
            },
            {
                title: "param",
                description: "element selector object",
                type: { type: "NameExpression", name: "ElementSelector" },
                name: "elementSelector",
            },
        ],
        result: { isResultPass: false, resultText: "" },
        timeStamp: null,
    },
    {
        command: "click",
        target: "//*[@id='div1']",
        iframe: [],
        potentialMatch: [],
        framePotentialMatch: [],
        __htmlPath: null,
        targetInnerText: "This is a paragrah",
        targetPicPath: null,
        timeoutMs: null,
        meta: {},
        isRequiredReview: false,
        isRequiredLocatorUpdate: false,
        isRequiredNewNameAndLocator: false,
        finalLocatorName: "",
        finalLocator: [""],
        functionAst: {
            path: "",
            name: "click",
            description: "Click UI element",
            params: [
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Frame" },
                    name: "frame",
                },
                {
                    title: "param",
                    description: "element selector object",
                    type: { type: "NameExpression", name: "ElementSelector" },
                    name: "elementSelector",
                },
                {
                    title: "param",
                    description:
                        "percentage of coorindation x within element. Use '0.5' if you want to click on center",
                    type: { type: "NameExpression", name: "number" },
                    name: "x",
                    value: null,
                },
                {
                    title: "param",
                    description:
                        "percentage of coorindation y within element. Use '0.5' if you want to click on center",
                    type: { type: "NameExpression", name: "number" },
                    name: "y",
                    value: null,
                },
            ],
            locators: [{ locator: ["invalid_locator"] }],
        },
        result: { isResultPass: false, resultText: "" },
        timeStamp: null,
    },
    {
        command: "waitElementExists",
        target: "//*[@id='header']",
        iframe: [],
        potentialMatch: [
            {
                Locator: ["#header"],
                screenshot: "componentPic/Header.png",
                path: "Header",
                selector: null,
            },
        ],
        framePotentialMatch: [],
        __htmlPath: null,
        targetInnerText: "This is header",
        targetPicPath: null,
        timeoutMs: null,
        meta: {},
        isRequiredReview: false,
        isRequiredLocatorUpdate: false,
        isRequiredNewNameAndLocator: false,
        finalLocatorName: "",
        finalLocator: [""],
        functionAst: {
            path: "",
            name: "waitElementExists",
            description: "element exists",
            params: [
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Frame" },
                    name: "frame",
                },
                {
                    title: "param",
                    description: "element selector object",
                    type: { type: "NameExpression", name: "ElementSelector" },
                    name: "elementSelector",
                },
                {
                    title: "param",
                    description: "healing snapshot file",
                    type: { type: "NameExpression", name: "HealingSnapshot" },
                    name: "healingSnapshot",
                    value: "",
                },
            ],
            locators: [{ locator: ["invalid_locator"] }],
            returnJsDoc: {
                title: "returns",
                description: null,
                type: { type: "NameExpression", name: "ElementHandle" },
            },
        },
        parameter: [
            {
                title: "param",
                description: null,
                type: { type: "NameExpression", name: "Frame" },
                name: "frame",
            },
            {
                title: "param",
                description: "element selector object",
                type: { type: "NameExpression", name: "ElementSelector" },
                name: "elementSelector",
            },
        ],
        result: { isResultPass: false, resultText: "" },
        timeStamp: null,
    },
    {
        command: "click",
        target: "//*[@id='header']",
        iframe: [],
        potentialMatch: [
            {
                Locator: ["#header"],
                screenshot: "componentPic/Header.png",
                path: "Header",
                selector: null,
            },
        ],
        framePotentialMatch: [],
        __htmlPath: null,
        targetInnerText: "This is header",
        targetPicPath: null,
        timeoutMs: null,
        meta: {},
        isRequiredReview: false,
        isRequiredLocatorUpdate: false,
        isRequiredNewNameAndLocator: false,
        finalLocatorName: "",
        finalLocator: [""],
        functionAst: {
            path: "",
            name: "click",
            description: "Click UI element",
            params: [
                {
                    title: "param",
                    description: null,
                    type: { type: "NameExpression", name: "Frame" },
                    name: "frame",
                },
                {
                    title: "param",
                    description: "element selector object",
                    type: { type: "NameExpression", name: "ElementSelector" },
                    name: "elementSelector",
                },
                {
                    title: "param",
                    description:
                        "percentage of coorindation x within element. Use '0.5' if you want to click on center",
                    type: { type: "NameExpression", name: "number" },
                    name: "x",
                    value: null,
                },
                {
                    title: "param",
                    description:
                        "percentage of coorindation y within element. Use '0.5' if you want to click on center",
                    type: { type: "NameExpression", name: "number" },
                    name: "y",
                    value: null,
                },
            ],
            locators: [{ locator: ["invalid_locator"] }],
        },
        result: { isResultPass: false, resultText: "" },
        timeStamp: null,
    },
];
