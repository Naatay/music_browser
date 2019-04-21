import React, { Component } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'react-bootstrap';

class ModalWindow extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            show: true,
        };
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.handleClose} size={this.props.size}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.children}</Modal.Body>
                <ModalFooter>
                    <Button variant="secondary" onClick={this.props.handleClose}>
                        Zamknij
                </Button>
                </ModalFooter>
            </Modal>

        );
    }
}

export default ModalWindow;
