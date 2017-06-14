import React from 'react';

const SideMenu = ({ savedQueries, deleteQuery,
    savedQueriesIsOpen, toggleSavedQueries, store }) => {

    const del = (e, query) => {
        e.stopPropagation();
        let queryDescrip = query.title ? query.title : query.queryDescrip.substring(0, 100);
        if (confirm("Delete Query: " + queryDescrip+"\nThis will delete this query permanently, are you sure?")) {
            store.deleteQuery(query.body);
        }
    }

    const renderSavedQueries = () => {
        return savedQueries.map((query, index) => {
            return (<div className="sidemenu-savedQuery" key={index} onClick={() => handleSavedQueryClick(query.body)}>{query && query.title && query.title.substring(0, 22)}
                <i className="fa fa-times" onClick={e => del(e, query)}></i></div>)
        })
    }

    const handleSavedQueryClick = (query) => {
        store.appendQuery(query);
        store.focus = true;
    }

    const savedCaret = () => {
        if (!savedQueries) { return null; }
        return savedQueriesIsOpen ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />;
    }

    return (
        <div className="Sidemenu">
            <a className="sidemenu-item" onClick={e => store.modal="config"}><i className="fa fa-cog" />   &nbsp;DB Config</a>
            {savedQueries && savedQueries.length > 0 &&
                <a className="sidemenu-item" onClick={toggleSavedQueries}>
                    <i className="fa fa-floppy-o" /> &nbsp;Saved Queries {savedCaret()}</a>}
            {savedQueries && savedQueries.length > 0 && savedQueriesIsOpen &&
                <div className="sidemenu-savedQueries">{renderSavedQueries()}</div>}
            <a className="sidemenu-item"><i className="fa fa-code" /> Query Translator</a>
            <a className="sidemenu-item"><i className="fa fa-download" /> &nbsp;Download Backup</a>
            <a className="sidemenu-item"><i className="fa fa-book" /> &nbsp;Documentation</a>
        </div>
    )
}

export default SideMenu;