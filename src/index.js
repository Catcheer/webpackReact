/*
 * @Description:
 * @Author: zhangchuangye
 * @Date: 2021-05-26 19:44:31
 */
const Didact = {
  createElement,
  render
}



function App(props) {
  return Didact.createElement('H1',null,"Hi",props.name)
}

const element=Didact.createElement(App,{name:'World'})

// const elemet = Didact.createElement(
//   'div',
//   {
//     title: 'foo'
//   },
//   Didact.createElement('a', null, 'link'),
//   Didact.createElement('b')
// )



function createElement (type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object' ? child : createTextElement(child)
      })
    }
  }
}

function createTextElement (text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createDom (fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(key => {
      dom[key] = fiber.props[key]
    })

  return dom
}

function commitRoot () {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork (fiber) {
  if (!fiber) return
  const domParent = fiber.parent.dom
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => (key = prev[key] !== next[key])
const isGone = key => !(key in next)
const isEvent= key => {
  console.log('key',typeof key)
  return key.startsWith('on')
}

function updateDom (dom, preProps, nextProps) {
  Object.keys(prevProps)
    .filter(isEvent)
    .fliter(key=> !(key in nextProps) ||isNew(prevProps,nextProps)(key) )
    .forEach(name=>{
      const eventName=name.toLowerCase().substring(2)
      console.log('eventName',eventName)
      dom.removeEventListener(eventName,prevProps[name])
      
    })
    // Add event listeners
  Object.keys(nextProps)
  .filter(isEvent)
  .filter(isNew(prevProps, nextProps))
  .forEach(name => {
    const eventType = name
      .toLowerCase()
      .substring(2)
    dom.addEventListener(
      eventType,
      nextProps[name]
    )
  })
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ''
    })
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })
}

function render (element, container) {
  console.log('render')

  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop (deadLine) {
  // console.log("deadLine", deadLine.timeRemaining());
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadLine.timeRemaining() < 1
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function reconcileChildren (wipFiber, elements) {
  let index = 0

  let oldFiber = wipFiber.alternate && wipFiber.alternate.child

  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if (element && !sameType) {
      //  add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }
    if (oldFiber && !sameType) {
      //  delete the oldFiber's node
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}

function performUnitOfWork (fiber) {
  console.log('fiber', fiber)
  //add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // //create new fibers
  // const elements = fiber.props.children;
  // console.log("elements", elements);
  // let index = 0;
  // let prevSibling = null;

  // while (index < elements.length) {
  //   const element = elements[index];
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     parent: fiber,
  //     dom: null
  //   };
  //   if (index === 0) {
  //     fiber.child = newFiber;
  //   } else {
  //     prevSibling.sibling = newFiber;
  //   }
  //   prevSibling = newFiber;
  //   index++;
  // }

  //  return next unit of work

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const rootElement = document.getElementById('root')

Didact.render(elemet, rootElement)
