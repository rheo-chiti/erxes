import * as React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Tip,
  ActionButtons,
  NameCard,
  FormControl,
  Button,
  Label,
  Icon,
  Tags
} from 'modules/common/components';
import { EngageTitle, HelperText } from '../styles';
import { MESSAGE_KINDS } from 'modules/engage/constants';

const propTypes = {
  message: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  show: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  setLive: PropTypes.func.isRequired,
  setLiveManual: PropTypes.func.isRequired,
  setPause: PropTypes.func.isRequired,
  isChecked: PropTypes.bool,
  toggleBulk: PropTypes.func.isRequired
};

class Row extends React.Component {
  constructor(props) {
    super(props);

    this.renderRemoveButton = this.renderRemoveButton.bind(this);
    this.toggleBulk = this.toggleBulk.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  renderLink(text, className, onClick) {
    const { __ } = this.context;

    return (
      <Tip text={__(text)} key={`${text}-${this.props.message._id}`}>
        <Button btnStyle="link" onClick={onClick} icon={className} />
      </Tip>
    );
  }

  renderLinks() {
    const msg = this.props.message;

    const edit = this.renderLink('Edit', 'edit', this.props.edit);
    const pause = this.renderLink('Pause', 'pause', this.props.setPause);
    const live = this.renderLink('Set live', 'play', this.props.setLive);
    const liveM = this.renderLink('Set live', 'play', this.props.setLiveManual);
    const show = this.renderLink('Show statistics', 'eye', this.props.show);

    const links = [];

    if (msg.method === 'email') {
      links.push(show);
    }

    if (msg.kind === MESSAGE_KINDS.MANUAL) {
      if (msg.isDraft) {
        return [...links, liveM];
      }

      return links;
    }

    if (msg.isDraft) {
      return [...links, edit, live];
    }

    if (msg.isLive) {
      return [...links, edit, pause];
    }

    return [...links, edit, live];
  }

  renderRemoveButton(message, onClick) {
    const { __ } = this.context;

    if (message.kind.toLowerCase().includes('auto')) {
      return (
        <Tip text={__('Delete')}>
          <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
        </Tip>
      );
    }
  }

  toggleBulk(e) {
    this.props.toggleBulk(this.props.message, e.target.checked);
  }

  renderRules() {
    const { message } = this.props;

    if (message.segment) {
      return (
        <HelperText>
          <Icon icon="piechart" /> {message.segment.name}
        </HelperText>
      );
    }

    const messenger = message.messenger || {};
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <HelperText key={rule._id}>
        <Icon icon="piechart" /> {rule.text} {rule.condition} {rule.value}
      </HelperText>
    ));
  }

  onClick() {
    const { message } = this.props;

    if (message.method === 'email') {
      return this.props.show();
    }

    return this.props.edit();
  }

  render() {
    let status = <Label lblStyle="default">Sending</Label>;

    const { isChecked, message, remove } = this.props;
    const { stats = {}, brand = {} } = message;

    const deliveryReports = Object.values(message.deliveryReports || {});
    const totalCount = deliveryReports.length;
    const { __ } = this.context;

    if (totalCount === stats.send) {
      status = <Label lblStyle="success">Sent</Label>;
    }

    return (
      <tr key={message._id}>
        <td>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={this.toggleBulk}
          />
        </td>
        <td>
          <EngageTitle onClick={this.onClick}>{message.title}</EngageTitle>
          {message.isDraft ? <Label lblStyle="primary">Draft</Label> : null}
          {this.renderRules()}
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={30} singleLine />
        </td>
        <td>{status}</td>
        <td className="text-primary">
          <Icon icon="cube" />
          <b> {totalCount}</b>
        </td>
        <td>
          {message.email ? (
            <div>
              <Icon icon="email-3" /> {__('Email')}
            </div>
          ) : (
            <div>
              <Icon icon="chat" /> {__('Messenger')}
            </div>
          )}
        </td>

        <td>
          <b>{brand ? brand.name : '-'}</b>
        </td>

        <td>
          <Icon icon="calendar" />{' '}
          {moment(message.createdDate).format('DD MMM YYYY')}
        </td>

        <td>
          <Tags tags={message.getTags} limit={1} />
        </td>

        <td>
          <ActionButtons>
            {this.renderLinks()}
            {this.renderRemoveButton(message, remove)}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
