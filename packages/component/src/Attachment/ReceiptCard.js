import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import { AdaptiveCardRenderer } from './AdaptiveCard';
import Context from '../Context';

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);
      const { HorizontalAlignment, TextSize, TextWeight } = adaptiveCards;

      builder.addTextBlock(content.title, { size: TextSize.Medium, weight: TextWeight.Bolder });

      const columns = builder.addColumnSet([75, 25]);

      // tslint:disable-next-line:no-unused-expression
      content.facts && content.facts.map(fact => {
        builder.addTextBlock(fact.key, { size: TextSize.Medium }, columns[0]);
        builder.addTextBlock(fact.value, { size: TextSize.Medium, horizontalAlignment: HorizontalAlignment.Right }, columns[1]);
      });

      // tslint:disable-next-line:no-unused-expression
      content.items && content.items.map(item => {
        if (item.image) {
          const columns = builder.addColumnSet([15, 75, 10]);

          builder.addImage(item.image.url, columns[0], item.image.tap);
          builder.addTextBlock(item.title, { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: true }, columns[1]);
          builder.addTextBlock(item.subtitle, { size: TextSize.Medium, wrap: true }, columns[1]);
          builder.addTextBlock(item.price, { horizontalAlignment: HorizontalAlignment.Right }, columns[2]);
        } else {
          const columns = builder.addColumnSet([75, 25]);

          builder.addTextBlock(item.title, { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: true }, columns[0]);
          builder.addTextBlock(item.subtitle, { size: TextSize.Medium, wrap: true }, columns[0]);
          builder.addTextBlock(item.price, { horizontalAlignment: HorizontalAlignment.Right }, columns[1]);
        }
      });

      if (!nullOrUndefined(content.vat)) {
        const vatCol = builder.addColumnSet([75, 25]);

        // TODO: Bring localization
        builder.addTextBlock('VAT', { size: TextSize.Medium, weight: TextWeight.Bolder }, vatCol[0]);
        builder.addTextBlock(content.vat, { horizontalAlignment: HorizontalAlignment.Right }, vatCol[1]);
      }

      if (!nullOrUndefined(content.tax)) {
        const taxCol = builder.addColumnSet([75, 25]);

        // TODO: Bring localization
        builder.addTextBlock('Tax', { size: TextSize.Medium, weight: TextWeight.Bolder }, taxCol[0]);
        builder.addTextBlock(content.tax, { horizontalAlignment: HorizontalAlignment.Right }, taxCol[1]);
      }

      if (!nullOrUndefined(content.total)) {
        const totalCol = builder.addColumnSet([75, 25]);

        // TODO: Bring localization
        builder.addTextBlock('Total', { size: TextSize.Medium, weight: TextWeight.Bolder }, totalCol[0]);
        builder.addTextBlock(content.total, { horizontalAlignment: HorizontalAlignment.Right, size: TextSize.Medium, weight: TextWeight.Bolder }, totalCol[1]);
      }

      builder.addButtons(content.buttons);

      return builder.card;
    });
  }

  render() {
    const {
      props: {
        attachment: { content } = {}
      }
    } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards }) =>
          <AdaptiveCardRenderer adaptiveCard={ content && this.buildCard(adaptiveCards, content) } />
        }
      </Context.Consumer>
    );
  }
}
