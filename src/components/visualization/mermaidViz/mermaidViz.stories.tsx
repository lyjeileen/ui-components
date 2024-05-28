import type { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import MermaidViz from './mermaidViz'

const meta: Meta<React.ComponentProps<typeof MermaidViz>> = {
  title: 'Rustic UI/Visualization/MermaidViz',
  component: MermaidViz,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
meta.argTypes = {
  ...meta.argTypes,
}

const decorators = [
  (Story: StoryFn) => {
    return (
      <div
        style={{
          width: 'clamp(250px, 70vw, 1000px)',
        }}
      >
        <Story />
      </div>
    )
  },
]

export const classDiagram = {
  args: {
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }`,
  },
  decorators,
}

export const Flow = {
  args: {
    code: `
    flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`,
  },
  decorators,
}

export const ERDiagram = {
  args: {
    title: 'Customer Order Management System ER Diagram',
    description:
      'This ER diagram illustrates the relationships in an ordering system where a customer has a delivery address, places orders, and is liable for invoices; delivery addresses receive orders, invoices cover orders, orders include order items, product categories contain products, and products are ordered in order items.',
    code: `
      erDiagram
    CUSTOMER }|..|{ DELIVERY-ADDRESS : has
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ INVOICE : "liable for"
    DELIVERY-ADDRESS ||--o{ ORDER : receives
    INVOICE ||--|{ ORDER : covers
    ORDER ||--|{ ORDER-ITEM : includes
    PRODUCT-CATEGORY ||--|{ PRODUCT : contains
    PRODUCT ||--o{ ORDER-ITEM : "ordered in"`,
  },
  decorators,
}

export const error = {
  args: {
    code: '',
  },
  decorators,
}
