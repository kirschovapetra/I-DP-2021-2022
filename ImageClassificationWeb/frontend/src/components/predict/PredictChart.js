import React from 'react';
import {Bar, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {initPredictions} from "../../utils";
import {CContainer, CSpinner} from '@coreui/react'
import i18n from "../../translation/i18n";


/**
 * Plot chart with classification prediction results
 * @param data - input data
 * @param loading - bool
 * @param height - height of chart
 * @param margin - chart margin
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
export const PredictChart = ({data, loading, height, margin}) => {

    const colors = [
        '#6cdbe0',
        '#98a9ff',
        '#d0afff',
        '#fd8fb5',
        '#ece190',
        '#9cbb8d',
        '#5e9d87',
        '#f5d494',
        '#8d86d9',
        '#f4afaf'
    ]

    const loadingData = initPredictions(Array(10).fill(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const divStyle = {width: "100%", height: height}

    const renderLegend = (props) => {
        return (
            <ul className="recharts-default-legend" style={{padding: '0px', margin: '0px', textAlign: 'center'}}>
                <li className="recharts-legend-item legend-item-0" style={{display: "inline-block", marginRight: "10px"}}>
                    <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32" version="1.1"
                         style={{display: "inline-block", verticalAlign: "middle", marginRight: "4px"}}>
                        <defs>
                            <pattern id="rainbow" patternUnits="userSpaceOnUse" width="32" height="32">
                                <image href="../../../../static/images/rainbow.png" x="0" y="0" width="32" height="32"/>
                            </pattern>
                        </defs>
                        <path stroke="none" fill="url(#rainbow)" d="M0,4h32v32h-32z" className="recharts-legend-icon"/>
                    </svg>
                    <span className="recharts-legend-item-text" style={{color: 'rgb(65, 62, 160)'}}>{i18n.t("predict.chartPercent")}</span>
                </li>
                <li className="recharts-legend-item legend-item-1" style={{display: "inline-block", marginRight: "10px"}}>
                    <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32" version="1.1"
                         style={{display: "inline-block", verticalAlign: "middle", marginRight: "4px"}}>
                        <path strokeWidth="4" fill="none" stroke="red" className="recharts-legend-icon"
                              d="M0,16h10.666666666666666 A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16
                                 H32M21.333333333333332,16 A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"/>
                    </svg>
                    <span className="recharts-legend-item-text" style={{color: "red"}}>{i18n.t("predict.chartThreshold")}</span>
                </li>
            </ul>
        )
    }

    return (
        <CContainer className={'mt-5 mb-2 mx-0 px-xs-0'}>
            <div style={divStyle}>
                <ResponsiveContainer height={height}>
                    <ComposedChart data={loading ? loadingData : data} margin={margin}>
                        <CartesianGrid stroke="#f5f5f5"/>
                        <XAxis dataKey="class"/>
                        <YAxis type="number" domain={[0.0, 100.0]} allowDataOverflow={true}/>
                        <Tooltip/>
                        <Legend layout="horizontal" verticalAlign="top" align="center"
                                wrapperStyle={{position: 'relative', top: "-110%"}}
                                content={renderLegend}

                        />
                        <Bar dataKey="percent" fill="#413ea0">
                            <LabelList dataKey="percent" position="top" className={{fontWeight: 'bold'}}/>
                            {
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index]}/>
                                ))
                            }
                        </Bar>
                        <Line type="monotone" dataKey="threshold" stroke="red" strokeWidth={3}/>
                    </ComposedChart>
                </ResponsiveContainer>
                {
                    loading &&
                    <>
                        <CSpinner className={'chart-spinner center'} color="primary"/>
                        <p className={'chart-spinner text-center'}>{i18n.t("predict.predLoading")}</p>
                    </>
                }
            </div>
        </CContainer>
    );
}