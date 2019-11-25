import { stringLiteral } from "@babel/types";

export default class Sgf4js {
  static parse(sgf: string): Game {
    let game = new Game();
    let currentNode: Node | undefined;
    for(let i = 0; i < sgf.length; i++) {
        let ch = sgf.charAt(i)

        // rootNode or a new subNode
        if (ch == "(") {
            if (currentNode == null) {
                currentNode = new Node(undefined);
                game.rootNode = currentNode;
            }
        }
        else if (ch == ")") {
            
        }
        else if (ch == ";") {
            let token:[number, string] = Sgf4js.consumeUntil(";", i+1, sgf);
            let props = Sgf4js.parseTokenToProps(token[1]);
            let node = new Node(currentNode, props);
            if (currentNode) {
                currentNode.nextNode = node;
                currentNode = node;
            }
            else throw new Error("This should never happen");
            
        }
    }
    return game;
  }

  static parseTokenToProps(token: string) : Map<string,string> {
    var propName = "";
    var propValue = "";
    var consumingValue = false;
    var chNext = "";
    var rtrn :Map<string, string> = new Map();
    for(let i = 0; i < token.length; i++) {
        let ch = token.charAt(i);
        if (ch == "[") {
            consumingValue = true;
            continue;
        }
        else if (ch == "]") {
            consumingValue = false;
            rtrn.set(propName.trim(), propValue.trim());

            if (token.length > (i+1)) {
                chNext = token.charAt(i+1);
            }

            if (chNext != "[") {
                propName = "";
                propValue = "";
            }
            continue;
        }

        if (consumingValue) {
            propValue+=ch;
        }
        else {
            propName+=ch;
        }
    }
    return rtrn;
  }

  static consumeUntil(testChar:string, startIdx:number, sgf:string): [number, string] {
    let rtrnString = []
    for(let i = startIdx; i < sgf.length; i++) {
        let ch = sgf.charAt(i);
        
        if (ch == testChar) {
            return [i, rtrnString.join("")]
        }
        rtrnString.push(ch)
    }
    return [-1,""];
  }
}

class Game {
    rootNode!: Node;
}

class Node {
    props: Map<string, string> = new Map();
    prevNode: Node | undefined;
    nextNode: Node | undefined;

    constructor(prevNode: Node | undefined, props?:Map<string, string>) {
        this.prevNode = prevNode;
        if (props) {
            this.props = props;
        }
    }
}