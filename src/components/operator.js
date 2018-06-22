function OperatorDefinitionException (message) {
  this.message = message
  this.name = 'OperatorDefinitionException'
}

class OperatorDefinition {
  constructor ({
    key = null,
    displayText = null,
    multiSelect = false
  } = {}) {
    if (!key) {
      throw new OperatorDefinitionException('A key must be provided for each OperatorDefinition!')
    }
    if (!displayText) {
      displayText = key
    }
    this.key = key
    this.displayText = displayText
    this.multiSelect = multiSelect
  }
}

const DataTypeOperators = {
  boolean: [
    new OperatorDefinition({ key: '=', displayText: 'is' }),
    new OperatorDefinition({ key: '!=', displayText: 'is_not' })
  ],
  string: [
    new OperatorDefinition({ key: '=', displayText: 'is' }),
    new OperatorDefinition({ key: 'begins', displayText: 'begins_with' }),
    new OperatorDefinition({ key: 'contains' })
  ],
  number: [
    new OperatorDefinition({ key: '=' }),
    new OperatorDefinition({ key: '<' }),
    new OperatorDefinition({ key: '<=' }),
    new OperatorDefinition({ key: '>' }),
    new OperatorDefinition({ key: '>=' })
  ],
  date: [
    new OperatorDefinition({ key: '=' }),
    new OperatorDefinition({ key: '<', displayText: 'before' }),
    new OperatorDefinition({ key: '<=', displayText: 'before_or_on' }),
    new OperatorDefinition({ key: '>', displayText: 'after' }),
    new OperatorDefinition({ key: '>=', displayText: 'after_or_on' })
  ],
  datetime: [
    new OperatorDefinition({ key: '=' }),
    new OperatorDefinition({ key: '<', displayText: 'before' }),
    new OperatorDefinition({ key: '<=', displayText: 'before_or_on' }),
    new OperatorDefinition({ key: '>', displayText: 'after' }),
    new OperatorDefinition({ key: '>=', displayText: 'after_or_on' })
  ],
  choice: [
    new OperatorDefinition({ key: '=', displayText: 'is', multiSelect: false }),
    new OperatorDefinition({ key: 'in', displayText: 'is_one_of', multiSelect: true })
  ]
}

export {
  DataTypeOperators,
  OperatorDefinition
}
