function getPearsonCorrelation(vec1, vec2) {
	var avgX = 0;
	var avgY = 0;
	var sum1 = 0;
	var sum2 = 0;
	var sum3 = 0;

	for (var i=0;i<vec1.length;i++)		//getting the averges
	{
	  avgX += +vec1[i];
	  avgY += +vec2[i];
	}
	avgX = avgX/vec1.length;
	avgY = avgY/vec2.length;
	
	for (var i=0;i<vec1.length;i++)	{	// getting the sum1
		sum1 += (+vec1[i] - avgX)*(+vec2[i] - avgY);	
		sum2 += Math.pow(+vec1[i] - avgX,2);		
		sum3 += Math.pow(+vec2[i] - avgY,2);		
	}
	var result = sum1/Math.sqrt((sum2*sum3),2);
	
	if (result>=-1.01 && result<=1.01)
		return result;
	else
		return 0;
}
