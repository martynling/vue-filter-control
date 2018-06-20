function ColumnDefinitionException (message) {
  this.message = message
  this.name = 'ColumnDefinitionException'
}

export default class ColumnDefinition {
  constructor ({
    name = '',
    displayName = '',
    dataType = 'string',
    options = [],
    maxItems = 1,
    notFilterable = false,
    optGroup = null
  } = {}) {
    this.name = name
    this.displayName = displayName
    this.options = options
    this.maxItems = maxItems
    this.notFilterable = notFilterable
    this.optGroup = optGroup
    if (['string', 'number', 'date', 'datetime', 'choice'].indexOf(dataType) === -1) {
      throw new ColumnDefinitionException('Column dataType must be either string, number, date, datetime or choice')
    }
    this.dataType = dataType
  }
}
