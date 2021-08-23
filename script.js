"use strict";
window.addEventListener("load", () => {
    const blocksWrapper = document.getElementById("blocksWrapper");
    const dialog = document.getElementsByTagName("dialog")[0];
    let isDelMode = false;
    const dataList = new Map([
        //$t: テキストボックス, $s: テキストボックスの文字列, $n: テキストボックスの数字
        ["$tと書く", "(output.innerHTML += $s);"],
        ["$tと書いて改行", "(output.innerHTML += $s +'<br>');"],
        ["$tと入力を求める", "prompt($s);"],
        ["$tの変数 =", "varList[$s] = "],
        ["$tの文字列", "$s;"],
        ["$tの数字", "$n;"],
        ["$tの数字 +", "$n - -"],
        ["$tの数字 -", "$n -"],
        ["$tの数字 mod", "$n %"],
        ["もし$tが0なら", "if($n===0) "],
        ["もし$tが0でないなら", "if($n!==0) "],
        ["$tが0でない限り","while($n!==0)"],
        ["$t回繰り返す", "for(let i=0;i<$n;i++)"],
        ["はじめる", "{"],
        ["おわる", "void 0}"],
    ]);
    class Blocks {
        constructor(name) {
            Blocks.blocksCount++;
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "checkbox" + Blocks.blocksCount;
            const span = document.createElement("span");
            span.appendChild(checkbox);
            
            const label = document.createElement("label");
            label.classList.add("blocks");
            label.innerHTML = name.replace(/\$t/g,"<input>");
            label.setAttribute("data-name",name);
            label.htmlFor = checkbox.id;
            span.appendChild(label);
            
            blocksWrapper.appendChild(span);
            checkbox.addEventListener("change", () => {
                if (isDelMode === false) label.classList.toggle("varBlocks");
                else {
                    blocksWrapper.removeChild(span);
                    if (blocksWrapper.childElementCount === 0) closeDialog();
                }
            });
        }
    }
    Blocks.blocksCount = 0;
    const setButtonFunc = (id, func) => {
        document.getElementById(id).addEventListener("click", func);
    }
    const showDialog = content => {
        document.getElementById("dialogContent").innerHTML = content;
        closeDialog();
        dialog.showModal();
    }
    const closeDialog = () => {
        isDelMode = false;
        dialog.close();
    };
    
    const toggleDisp = () => {
        document.getElementById("editor").classList.toggle("nv");
        document.getElementById("view").classList.toggle("nv");
    }
    const output = document.getElementsByTagName("output")[0];
    setButtonFunc("add", () => {
        showDialog('<p>追加するブロックを選んでください。</p><div id="selectBlocksWrapper"></div>');
        for (const name of dataList.keys()) {
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add("selectBlocks");
            button.innerHTML = name.replace(/\$t/g,'<input disabled="disabled">');
            document.getElementById("selectBlocksWrapper").appendChild(button);
            button.addEventListener("click", () => {
                new Blocks(name);
                closeDialog();
            });
        }
    });
    setButtonFunc("del1", () => {
        if (blocksWrapper.childElementCount !== 0) {
            //blocksWrapper.removeChild(blocksWrapper.lastElementChild);
            document.getElementById("dialogContent").innerHTML = "一つ選んでください";
            dialog.show();
            isDelMode = true;
            
        }
    });
    setButtonFunc("delAll", () => {
        blocksWrapper.innerHTML = "";
    });
    setButtonFunc("run", () => {
        const varList = Object.create(null);
        toggleDisp();
        output.innerHTML = "";
        let bracketsCount =0;
        let jsCode = "";
        for (const label of document.getElementsByTagName("label")) {
            const $Value = label.getElementsByTagName("input")[0]?.value ?? "";
            let code = dataList.get(label.getAttribute("data-name"));
            if (label.classList.contains("varBlocks")) {
                code = code.replace(/\$s/g, `String(varList["${$Value}"]??'')`).replace(/\$n/g, `Number(varList["${$Value}"]??'')`);
            } else code = code.replace(/\$s/g, `"${$Value}"`).replace(/\$n/g, `Number("${$Value.normalize('NFKC')}")`);
            if (code === "{") bracketsCount++;
            if (code === "void 0}") bracketsCount--;
            jsCode += code;
        }
        alert(bracketsCount)
        if (bracketsCount > 0) jsCode = jsCode + "}".repeat(bracketsCount);
        if (bracketsCount < 0) jsCode = "{".repeat(-bracketsCount) + jsCode;
        alert((jsCode + "0;").replace(/;/g, ";\n"))
        try{eval(jsCode + "0;");} catch{output.innerHTML="<span style='color:red'>エラー</span>"}
    })
    
    setButtonFunc("help", () => {
        showDialog("<p>ブロックのテキストボックス以外の場所をクリックすると、変数モードになります。</p>");
    });
    setButtonFunc("closeDialog", closeDialog);
    setButtonFunc("back", toggleDisp);
});
