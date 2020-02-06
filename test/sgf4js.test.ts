import Sgf4js from '../src/sgf4js'
import * as glob from 'glob'

import { readFileSync } from 'fs'
import { nodeInternals } from 'stack-utils'

describe('Simple tests', () => {
  it('Number of nodes', () => {
    let rawSgf = `(;SZ[19]
;W[kd]
;B[kc]
)
`

    let game = Sgf4js.parse(rawSgf)

    expect(game.getNoNodes()).toEqual(3)
    expect(game.getNoMoves()).toEqual(2)
  }),
    it('No root node', () => {
      let rawSgf = `(;W[kd];B[kc])`
      let game = Sgf4js.parse(rawSgf)
      expect(game.getNoNodes()).toEqual(2)
      expect(game.getNoMoves()).toEqual(2)
    }),
    it('Escaping in properties', () => {
      let rawSgf = `(;GM[1]AP[GOWrite:2.3.48]CA[UTF-8]ST[2]FF[4]SZ[19]FG[259:]AB[oe][nb][pe][jc][lc][oc][pc][pp][nq][qd]PW[ ]C[First comment]PB[ ]L[hc][le]PM[2]AW[hc][dd][nc][pf][qf][md][od][qj][dp][le]GN[ ]
  ;W[kd]C[Answer\:]
  ;B[kc]C[Second comment]
  ;L[hc][le][kd]W[ie]C[Third comment]
  ;
  )
  `

      let game = Sgf4js.parse(rawSgf)
      expect(game.getProps().get('CA')).toEqual('UTF-8')
      expect(game.rootNode!.nextNode!.props.get('C')).toEqual('Answer:')
    }),
    it('Super Simple Branching', () => {
      let rawSgf = `(;SZ[19];B[dd](;W[pp];B[pd];W[dp]);W[dp])`

      let game = Sgf4js.parse(rawSgf)
      expect(game.rootNode!.props.get('SZ')).toEqual('19')
      expect(game.rootNode!.nextNode!.props.get('B')).toEqual('dd')
      expect(game.getNoMoves()).toEqual(2)
      // previous expectations are more for debugging when
      // the following is not working
      expect(game.rootNode!.nextNode!.children.size).toEqual(1)
    }),
    it('Simple branching', () => {
      let rawSgf = `(;B[dd]
(;W[pp]
;B[pd]
;W[dp])
(;W[pd]
;B[pp])
(;W[dp]
;B[pp]))
    `

      let game = Sgf4js.parse(rawSgf)

      expect(game.getNoNodes()).toEqual(1)
      expect(game.getNoMoves()).toEqual(1)
      expect(game.rootNode!.children.size).toEqual(3)
    })

  it('Simple branching with root node', () => {
    let rawSgf = `(;SZ[19];B[dd]
  (;W[pp]
  ;B[pd]
  ;W[dp])
  (;W[pd]
  ;B[pp])
  (;W[dp]
  ;B[pp]))`

    let game = Sgf4js.parse(rawSgf)

    expect(game.getNoNodes()).toEqual(2)
    expect(game.getNoMoves()).toEqual(1)
    expect(game.rootNode!.nextNode!.children.size).toEqual(3)
  })
})

/**
 * Parse bunch of sgf files and make sure none errors on parsing.
 */
describe('Bulk SGF Tests', () => {
  it('All SGF files under sgf-files', () => {
    let fileNames = glob.sync('./test/**/*.sgf')

    fileNames.slice(0, 1).forEach(fileName => {
      let fileContents = readFileSync(fileName, 'utf-8')
      let sgf = Sgf4js.parse(fileContents)
      let node = sgf.rootNode!
      while (node.hasNext()) {
        node = node.nextNode!
      }
    })
  })
})

describe('Long game with multiple branches', () => {
  it('Long game', () => {
    let fileNames = glob.sync('./test/sgf-files/long-game.sgf')

    fileNames.slice(0, 1).forEach(fileName => {
      let fileContents = readFileSync(fileName, 'utf-8')
      let sgf = Sgf4js.parse(fileContents)
      let node = sgf.rootNode!
      while (node.hasNext()) {
        node = node.nextNode!
        if (!node.isMove()) {
        }
      }
    })
  })
})
