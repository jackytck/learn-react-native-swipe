import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  UIManager,
  View
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4
const SWIPE_OUT_DURATION = 400

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }

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
          this.forceSwipe('right')
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left')
        } else {
          this.resetPosition()
        }
      }
    })

    this.state = { panResponder, position, index: 0 }
  }

  componentWillUpdate () {
    const exp = UIManager.setLayoutAnimationEnabledExperimental
    exp && exp(true)
    LayoutAnimation.spring()
  }

  forceSwipe (direction) {
    const x = direction === 'right' ? 2 * SCREEN_WIDTH : -2 * SCREEN_WIDTH
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction))
  }

  onSwipeComplete (direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props
    const item = data[this.state.index]

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
    this.state.position.setValue({ x: 0, y: 0 })
    this.setState({ index: this.state.index + 1 })
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
    const { index } = this.state
    if (index >= this.props.data.length) {
      return this.props.renderNoMoreCards()
    }
    return this.props.data.map((item, i) => {
      if (i < index) {
        return
      }
      if (i === index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      }
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      )
    }).reverse()
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
  renderCard: PropTypes.func,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  renderNoMoreCards: PropTypes.func
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
}

export default Deck
