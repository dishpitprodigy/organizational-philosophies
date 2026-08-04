import { render, screen } from '@testing-library/react';
import { WorkIntakePage } from './WorkIntakePage';

describe('WorkIntakePage', () => {
  it('embeds the existing work-intake prototype', () => {
    render(<WorkIntakePage />);

    expect(screen.getByTitle('Northstar Work Intake')).toHaveAttribute(
      'src',
      'work-intake-assets/index.html',
    );
  });
});
