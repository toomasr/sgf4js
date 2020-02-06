import { stringLiteral } from '@babel/types'

export default class Sgf4js {
  static parse(sgf: string): Game {
    let game = new Game()
    let currentNode: Node | undefined
    let parentNodes = new Array()

    for (let i = 0; i < sgf.length; i++) {
      let prevCh = ''
      if (i > 0) prevCh = sgf.charAt(i - 1)
      let ch = sgf.charAt(i)

      // rootNode or a new subNode
      if (ch == '(') {
        // we have the start of main line
        if (game.rootNode == undefined) {
          currentNode = new Node(undefined)
          game.rootNode = currentNode
        }
        // we have branching
        else {
          let newNode = new Node(undefined)
          debugger
          if (currentNode?.isEmpty()) {
            currentNode = currentNode.prevNode
          }
          currentNode!.addChild(newNode)
          newNode.setParent(currentNode!)
          parentNodes.push(currentNode)
          currentNode = newNode
        }
      } else if (ch == ';' || ch == ')') {
        let token: [number, string] = Sgf4js.consumeUntilDelimiter(i + 1, sgf)
        i = token[0] - 1

        let props = Sgf4js.parseTokenToProps(token[1])

        currentNode!.props = props

        if (ch == ')') {
          if (parentNodes.length > 0) {
            currentNode = parentNodes.pop()
            let node = new Node(currentNode, undefined)
            currentNode!.nextNode = node
            currentNode = node
          }
        } else if (ch == ';') {
          // if we already have an empty node no need to
          // create a new one - this cleans up the last
          // empty node that would appear by design
          if (!currentNode!.isEmpty()) {
            let node = new Node(currentNode, undefined)
            currentNode!.nextNode = node
            currentNode = node
          }
        }
      }
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

      if (ch == ';' || ch == ')' || ch == '(') {
        return [i, rtrnString.join('')]
      }
      rtrnString.push(ch)
    }
    return [sgf.length, '']
  }
}

class Game {
  private noMoves: number = -1
  private noNodes: number = -1
  rootNode: Node | undefined

  constructor() {}

  public getNoNodes(): number {
    if (this.noNodes == -1) {
      this.postProcess()
    }
    return this.noNodes
  }

  public getNoMoves(): number {
    if (this.noMoves == -1) {
      this.postProcess()
    }
    return this.noMoves
  }

  public getProps(): Map<string, string> {
    return this.rootNode!.props
  }

  public postProcess() {
    let tmpNode = this.rootNode!
    this.noMoves = 0
    this.noNodes = 0

    while (tmpNode.hasNext()) {
      this.noNodes++
      if (tmpNode.isMove()) {
        this.noMoves++
      }
      tmpNode = tmpNode.nextNode!
    }
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

  public isEmpty(): boolean {
    if (this.props.size > 0) return false

    if (this.nextNode != undefined) return false

    if (this.children.size > 0) return false

    return true
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
