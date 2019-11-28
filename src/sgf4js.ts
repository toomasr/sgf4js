import { stringLiteral } from '@babel/types'

export default class Sgf4js {
  static parse(sgf: string): Game {
    let game = new Game()
    let currentNode: Node | undefined
    let parentNodes = new Array()
    for (let i = 0; i < sgf.length; i++) {
      let ch = sgf.charAt(i)

      // rootNode or a new subNode
      if (ch == '(') {
        if (currentNode == null) {
          currentNode = new Node(undefined)
          game.rootNode = currentNode
        }
        // we have branching!
        else {
          let newNode = new Node(undefined)
          currentNode.addChild(newNode)
          newNode.setParent(currentNode)
          parentNodes.push(currentNode)
          currentNode = newNode
        }
      } else if (ch == ';' || ch == ')') {
        let token: [number, string] = Sgf4js.consumeUntilDelimiter(i + 1, sgf)
        i = token[0] - 1

        let props = Sgf4js.parseTokenToProps(token[1])
        let node = new Node(currentNode, props)
        if (currentNode) {
          currentNode.nextNode = node
          currentNode = node
        } else {
          currentNode = node
        }

        if (ch == ')') {
          currentNode = parentNodes.pop()
        }
      }
    }
    // remove the last added node as the logic creates actually an empty node in the end
    // we'll just remove the reference to it
    if (
      currentNode != null &&
      currentNode.props.size == 0 &&
      currentNode.prevNode != null
    ) {
      currentNode!.prevNode!.nextNode = undefined
    }
    return game
  }

  static parseTokenToProps(token: string): Map<string, string> {
    var propName = ''
    var propValue = ''
    var consumingValue = false
    var chNext = ''
    var rtrn: Map<string, string> = new Map()
    for (let i = 0; i < token.length; i++) {
      let ch = token.charAt(i)
      if (ch == '[') {
        consumingValue = true
        continue
      } else if (ch == ']') {
        consumingValue = false
        rtrn.set(propName.trim(), propValue.trim())

        if (token.length > i + 1) {
          chNext = token.charAt(i + 1)
        }

        if (chNext != '[') {
          propName = ''
          propValue = ''
        }
        continue
      }

      if (consumingValue) {
        propValue += ch
      } else {
        propName += ch
      }
    }
    return rtrn
  }

  static consumeUntilDelimiter(
    startIdx: number,
    sgf: string
  ): [number, string] {
    let rtrnString = []
    for (let i = startIdx; i < sgf.length; i++) {
      let ch = sgf.charAt(i)

      if (ch == ';' || ch == ')') {
        return [i, rtrnString.join('')]
      }
      rtrnString.push(ch)
    }
    return [sgf.length, '']
  }
}

class Game {
  rootNode: Node

  constructor() {
    this.rootNode = new Node(undefined, undefined)
  }
}

class Node {
  props: Map<string, string> = new Map<string, string>()
  children: Set<Node> = new Set<Node>()
  prevNode: Node | undefined
  nextNode: Node | undefined
  parentNode: Node | undefined

  constructor(prevNode: Node | undefined, props?: Map<string, string>) {
    this.prevNode = prevNode
    if (props) {
      this.props = props
    }
  }

  setParent(node: Node) {
    this.parentNode = node
  }
  addChild(newNode: Node) {
    this.children.add(newNode)
  }

  public hasNext(): boolean {
    return this.nextNode != null
  }

  public isMove(): boolean {
    return this.props.has('W') || this.props.has('B')
  }

  public getMove(): string {
    if (this.props.has('W')) {
      return this.props.get('W')!
    } else {
      return this.props.get('B')!
    }
  }
}
