import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Dimensions,
  PanResponder,
  View
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4
const SWIPE_OUT_DURATION = 400

class Deck extends Component {
  constructor (props) {
    super(props)

    const position = new Animated.ValueXY()
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy
        })
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipeRight()
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // this.forceSwipeLeft()
        } else {
          this.resetPosition()
        }
      }
    })

    this.state = { panResponder, position }
  }

  forceSwipeRight () {
    Animated.timing(this.state.position, {
      toValue: { x: 2 * SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start()
  }

  resetPosition () {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start()
  }

  getCardStyle () {
    const { position } = this.state
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-30deg', '0deg', '30deg']
    })

    return {
      ...this.state.position.getLayout(),
      transform: [{ rotate }]
    }
  }

  renderCards () {
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return this.props.renderCard(item)
    })
  }

  render () {
    return (
      <View>
        {this.renderCards()}
      </View>
    )
  }
}

Deck.propTypes = {
  data: PropTypes.array,
  renderCard: PropTypes.func
}

export default Deck
