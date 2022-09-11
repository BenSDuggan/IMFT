

function Sidebar() {
    return (
        <div id="sidebar">
            <div id="all-flights">
                <table>
                    <tbody>
                    <tr>
                        <td>
                            <div>
                                <span>Nick name</span>
                                <span>(N...)</span> 
                            </div>
                            <div>
                                <span>Heading</span>
                                <span>Altitude</span>
                            </div>
                            <div>
                                <span>H Speed</span>
                                <span>V Speed</span>
                            </div>
                            <div>
                                <span>Latitude</span>
                                <span>Longitude</span>
                                <span>Time</span>
                            </div>
                        </td>
                        <td>
                            <span>Nick name</span>
                            <span>(Nick name)</span> <br />
                            <span>Heading</span>
                            <span>Altitude</span> <br />
                            <span>Latitude</span>
                            <span>Longitude</span> <br/>
                        </td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>)
}

export default Sidebar;